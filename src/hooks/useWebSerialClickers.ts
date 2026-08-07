import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { parseSerialLine } from '../utils/serialParser';
import { AnswerType } from '../types';

export interface ClickEvent {
  timestamp: number;
  name: string;
  rollNum?: number;
  macId?: string;
  answer: AnswerType;
}

export const useWebSerialClickers = () => {
  const { showToast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [answeredRolls, setAnsweredRolls] = useState<Set<number>>(new Set());
  const [lastAnswers, setLastAnswers] = useState<Record<number, AnswerType>>({});
  const [detectedMacs, setDetectedMacs] = useState<Set<string>>(new Set());
  const [detectedEspIds, setDetectedEspIds] = useState<Record<string, number>>({});
  const [clickLog, setClickLog] = useState<ClickEvent[]>([]);
  
  // Global cache for resolved students so they don't change across re-mounts
  const clickResolutionCache = useRef<Record<number, any>>({});

  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const readableStreamClosedRef = useRef<Promise<void> | null>(null);

  // Keep track of registered senders to map names to index/rolls/macs if needed
  const nameToRollMap = useRef<Record<string, number>>({});
  const nameToMacMap = useRef<Record<string, string>>({});
  const macToRollMap = useRef<Record<string, number>>({});
  const lastActiveMac = useRef<string | null>(null);

  const connect = useCallback(async () => {
    if (!('serial' in navigator)) {
      showToast('Web Serial API is not supported in this browser. Please use Chrome or Edge.', 'error');
      return;
    }

    try {
      console.log('--- Initiating Web Serial Connection ---');
      const port = await (navigator as any).serial.requestPort();

      try {
        await port.open({ baudRate: 115200 });
      } catch (e: any) {
        if (e.name === 'InvalidStateError' || (e.message && e.message.includes('already open'))) {
          console.log('[Web Serial] Port is already open. Reusing existing connection.');
        } else {
          throw e;
        }
      }

      if (port.readable && port.readable.locked) {
        console.warn('[Web Serial] Port is already locked by an active reader. Aborting duplicate connection.');
        portRef.current = port;
        setIsConnected(true);
        return;
      }

      portRef.current = port;
      setIsConnected(true);

      const portInfo = port.getInfo();
      console.log(`[Success] Connected to Serial Port!`);
      console.log(`USB Vendor ID: ${portInfo.usbVendorId}, Product ID: ${portInfo.usbProductId}`);
      console.log('Listening for Main ESP data at 115200 baud...');

      port.addEventListener('disconnect', () => {
        console.warn('[Disconnected] Serial port disconnected unexpectedly.');
        setIsConnected(false);
      });

      // Send LIST command immediately to pull any existing roster
      setTimeout(async () => {
        if (portRef.current?.writable) {
          try {
            console.log('[Command] Sending LIST command to fetch registered senders...');
            const writer = portRef.current.writable.getWriter();
            const encoder = new TextEncoder();
            await writer.write(encoder.encode('LIST\n'));
            writer.releaseLock();
          } catch (e) { }
        }
      }, 500);

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      readableStreamClosedRef.current = readableStreamClosed;

      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      let buffer = '';
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            buffer += value;
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim().length > 0) {
                const parsed = parseSerialLine(line);

                // Basic log for everything coming in
                console.log(`[Serial RX] ${line.trim()}`);

                if (parsed.type === 'BOOT_READY') {
                  console.log('[System] Master ESP is Ready and waiting for clickers.');
                }

                if (parsed.type === 'NEW_PAIR_REQUEST') {
                  console.log(`[Pairing] New device requesting connection! MAC ID: ${parsed.data.mac}`);
                  lastActiveMac.current = parsed.data.mac;
                  setDetectedMacs(prev => {
                    const next = new Set(prev);
                    next.add(parsed.data.mac);
                    return next;
                  });
                }

                if (parsed.type === 'SENDER_UNIQUE_ID') {
                  const mac = lastActiveMac.current;
                  if (mac) {
                    setDetectedEspIds(prev => ({ ...prev, [mac]: parsed.data.id }));
                  }
                }

                if (parsed.type === 'LIST_ITEM') {
                  console.log(`[Roster Sync] Registered Student -> Roll: ${parsed.data.index} | Name: ${parsed.data.name} | MAC: ${parsed.data.mac}`);
                  nameToRollMap.current[parsed.data.name.toLowerCase()] = parsed.data.index;
                  nameToMacMap.current[parsed.data.name.toLowerCase()] = parsed.data.mac;
                  macToRollMap.current[parsed.data.mac] = parsed.data.index;
                  setDetectedMacs(prev => {
                    const next = new Set(prev);
                    next.add(parsed.data.mac);
                    return next;
                  });
                }

                if (parsed.type === 'ANSWER_DATA') {
                  const { name, answer, isSimple } = parsed.data;
                  console.log(`\n========================================`);
                  console.log(`[VOTE RECEIVED] Student: ${name} | Selected Option: ${answer}`);
                  console.log(`========================================\n`);
                  const lowerName = name.toLowerCase();

                  let rollNum = nameToRollMap.current[lowerName];
                  let macId = nameToMacMap.current[lowerName];

                  if (isSimple && lastActiveMac.current) {
                    macId = lastActiveMac.current;
                    if (rollNum === undefined) {
                      rollNum = macToRollMap.current[macId];
                    }
                  } else if (rollNum === undefined) {
                    const num = parseInt(name, 10);
                    if (!isNaN(num)) {
                      rollNum = num;
                    }
                  }

                  if (rollNum !== undefined) {
                    setAnsweredRolls((prev) => {
                      const next = new Set(prev);
                      next.add(rollNum);
                      return next;
                    });
                    setLastAnswers((prev) => ({
                      ...prev,
                      [rollNum]: answer
                    }));
                  }

                  setClickLog((prev) => [{
                    timestamp: Date.now(),
                    name: isSimple ? 'Unknown' : name,
                    rollNum,
                    macId,
                    answer
                  }, ...prev].slice(0, 50)); // Keep last 50 clicks
                }
              }
            }
          }
        }
      } catch (error) {
        // Stream read error or cancellation
      } finally {
        reader.releaseLock();
      }
    } catch (err) {
      console.error('Serial connection failed:', err);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) { }
      readerRef.current = null;
    }

    if (readableStreamClosedRef.current) {
      try {
        await readableStreamClosedRef.current.catch(() => { });
      } catch (e) { }
      readableStreamClosedRef.current = null;
    }

    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch (e) { }
      portRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const resetAnswered = useCallback(() => {
    setAnsweredRolls(new Set());
    setLastAnswers({});
    setClickLog([]);
    clickResolutionCache.current = {};
  }, []);

  const clearDetectedMacs = useCallback(() => {
    setDetectedMacs(new Set());
  }, []);

  // Clean up serial port connection on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        console.log('[Web Serial] Hook unmounted, tearing down connection.');
        disconnect();
      }
    };
  }, [isConnected, disconnect]);

  return { isConnected, connect, disconnect, answeredRolls, lastAnswers, clickLog, resetAnswered, detectedMacs, detectedEspIds, clearDetectedMacs, clickResolutionCache };
}
