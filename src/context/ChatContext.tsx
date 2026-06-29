import React, { createContext, useContext, useState } from "react";

interface ChatContextType {
    unreadMap: Record<number, number>;
    setUnreadMap: React.Dispatch<
        React.SetStateAction<Record<number, number>>
    >;
}
const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [unreadMap, setUnreadMap] = useState<Record<number, number>>({});

    return (
        <ChatContext.Provider
            value={{
                unreadMap,
                setUnreadMap
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);

    if (!context) {
        throw new Error("useChatContext must be used inside ChatProvider");
    }

    return context;
};