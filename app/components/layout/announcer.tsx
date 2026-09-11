import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type Announce = (message: string) => void;

const AnnouncerContext = createContext<Announce>(() => {});

// Two alternating polite regions: writing the same text twice into one region is not re-announced,
// and a quick second message never wipes the first.
export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<[string, string]>(["", ""]);
  const slot = useRef(0);

  const announce = useCallback<Announce>((message) => {
    slot.current = slot.current === 0 ? 1 : 0;
    const target = slot.current;
    setMessages((current) => (target === 0 ? [message, current[1]] : [current[0], message]));
  }, []);

  const value = useMemo(() => announce, [announce]);

  return (
    <AnnouncerContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {messages[0]}
      </div>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {messages[1]}
      </div>
    </AnnouncerContext.Provider>
  );
}

export function useAnnounce(): Announce {
  return useContext(AnnouncerContext);
}
