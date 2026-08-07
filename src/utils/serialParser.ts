import { AnswerType } from '../types';

export interface ParsedLineResult {
  type:
  | 'BOOT_AP_IP'
  | 'BOOT_WIFI_INFO'
  | 'BOOT_STA_MAC'
  | 'BOOT_READY'
  | 'NEW_PAIR_REQUEST'
  | 'ENTER_NAME_PROMPT'
  | 'SAVED_AS'
  | 'KNOWN_SENDER'
  | 'PAIRED_SENDER'
  | 'ANSWER_DATA'
  | 'LIST_HEADER'
  | 'LIST_ITEM'
  | 'LIST_EMPTY'
  | 'LIST_FOOTER'
  | 'DELETED_SENDER'
  | 'INDEX_NOT_FOUND'
  | 'CLEAR_CONFIRM'
  | 'CLEAR_COMPLETED'
  | 'UNKNOWN_COMMAND'
  | 'SENDER_UNIQUE_ID'
  | 'RAW_LINE';
  data?: any;
}

export function parseSerialLine(line: string): ParsedLineResult {
  const trimmed = line.trim();

  // AP IP: 192.168.4.1
  const apIpMatch = trimmed.match(/^AP IP:\s*([0-9.]+)/i);
  if (apIpMatch) {
    return { type: 'BOOT_AP_IP', data: { ip: apIpMatch[1] } };
  }

  // Connect to Wi-Fi: QuizReceiver  (pass: 12345678)
  const wifiMatch = trimmed.match(/^Connect to Wi-Fi:\s*(.*?)\s*\(pass:\s*(.*?)\)/i);
  if (wifiMatch) {
    return {
      type: 'BOOT_WIFI_INFO',
      data: { ssid: wifiMatch[1], password: wifiMatch[2] },
    };
  }

  // STA MAC (share with senders): AA:BB:CC:DD:EE:FF
  const macMatch = trimmed.match(/^STA MAC \(share with senders\):\s*([0-9A-Fa-f:]+)/i);
  if (macMatch) {
    return { type: 'BOOT_STA_MAC', data: { staMac: macMatch[1].toUpperCase() } };
  }

  // Ready. Commands: LIST | DEL n | CLEAR
  if (trimmed.startsWith('Ready.') || trimmed.includes('Commands: LIST | DEL n | CLEAR')) {
    return { type: 'BOOT_READY' };
  }

  // [NEW] Pair request from AA:BB:CC:DD:EE:FF
  const newPairMatch = trimmed.match(/^\[NEW\]\s*Pair request from\s*([0-9A-Fa-f:]+)/i);
  if (newPairMatch) {
    return { type: 'NEW_PAIR_REQUEST', data: { mac: newPairMatch[1].toUpperCase() } };
  }

  // Also support new format: Sender MAC: D8:BF:C0:59:0B:D1
  const senderMacMatch = trimmed.match(/^Sender MAC:\s*([0-9A-Fa-f:]+)/i);
  if (senderMacMatch) {
    return { type: 'NEW_PAIR_REQUEST', data: { mac: senderMacMatch[1].toUpperCase() } };
  }

  // Enter name:
  if (trimmed.toLowerCase().startsWith('enter name:')) {
    return { type: 'ENTER_NAME_PROMPT' };
  }

  // Sender unique ID: 7
  const senderIdMatch = trimmed.match(/^Sender unique ID:\s*(\d+)/i);
  if (senderIdMatch) {
    return { type: 'SENDER_UNIQUE_ID', data: { id: parseInt(senderIdMatch[1], 10) } };
  }

  // Saved as: Alex
  const savedAsMatch = trimmed.match(/^Saved as:\s*(.*)/i);
  if (savedAsMatch) {
    return { type: 'SAVED_AS', data: { name: savedAsMatch[1].trim() } };
  }

  // [KNOWN] Alex
  const knownMatch = trimmed.match(/^\[KNOWN\]\s*(.*)/i);
  if (knownMatch) {
    return { type: 'KNOWN_SENDER', data: { name: knownMatch[1].trim() } };
  }

  // Paired: Alex
  const pairedMatch = trimmed.match(/^Paired:\s*(.*)/i);
  if (pairedMatch) {
    return { type: 'PAIRED_SENDER', data: { name: pairedMatch[1].trim() } };
  }

  // Answer data: [Alex          ]  A
  // Pattern: [ <15 chars name padded> ] <2 spaces> <A/B/C/D>
  const answerMatch = line.match(/^\[([^\]]{1,25})\]\s+([ABCD])$/);
  if (answerMatch) {
    const senderName = answerMatch[1].trim();
    const answer = answerMatch[2] as AnswerType;
    return { type: 'ANSWER_DATA', data: { name: senderName, answer, isSimple: false } };
  }

  // New format: Answer received: B
  const simpleAnswerMatch = trimmed.match(/^Answer received:\s*([ABCD])/i);
  if (simpleAnswerMatch) {
    return { type: 'ANSWER_DATA', data: { name: 'Unknown', answer: simpleAnswerMatch[1].toUpperCase() as AnswerType, isSimple: true } };
  }

  // Sender ID format: Answer received from sender ID 7: B
  const senderIdAnswerMatch = trimmed.match(/^Answer received from sender ID (\d+):\s*([ABCD])/i);
  if (senderIdAnswerMatch) {
    return { type: 'ANSWER_DATA', data: { name: senderIdAnswerMatch[1], answer: senderIdAnswerMatch[2].toUpperCase() as AnswerType, isSimple: false } };
  }

  // LIST items: [0]  Alex             AA:BB:CC:DD:EE:FF
  const listItemMatch = trimmed.match(/^\[(\d+)\]\s+([^\s]+(?: [^\s]+)*)\s+([0-9A-Fa-f:]{17})$/);
  if (listItemMatch) {
    return {
      type: 'LIST_ITEM',
      data: {
        index: parseInt(listItemMatch[1], 10),
        name: listItemMatch[2].trim(),
        mac: listItemMatch[3].toUpperCase(),
      },
    };
  }

  if (trimmed === 'No senders registered.') {
    return { type: 'LIST_EMPTY' };
  }

  if (trimmed.startsWith('── Registered senders')) {
    return { type: 'LIST_HEADER' };
  }

  // Deleted: Alex
  const deletedMatch = trimmed.match(/^Deleted:\s*(.*)/i);
  if (deletedMatch) {
    return { type: 'DELETED_SENDER', data: { name: deletedMatch[1].trim() } };
  }

  if (trimmed === 'Index not found.') {
    return { type: 'INDEX_NOT_FOUND' };
  }

  // Type CLEAR again to confirm.
  if (trimmed.includes('Type CLEAR again to confirm')) {
    return { type: 'CLEAR_CONFIRM' };
  }

  // Registry + log cleared.
  if (trimmed.includes('Registry + log cleared')) {
    return { type: 'CLEAR_COMPLETED' };
  }

  if (trimmed.includes('Unknown command')) {
    return { type: 'UNKNOWN_COMMAND' };
  }

  return { type: 'RAW_LINE', data: line };
}
