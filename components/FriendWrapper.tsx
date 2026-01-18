'use client'

import { FriendProvider } from '@/contexts/FriendContext'
import FriendProfileModal from '@/components/Modals/FriendProfileModal'
import { useFriendContext } from '@/contexts/FriendContext'

// Internal component that uses the context
function FriendProfileModalWrapper() {
    const { selectedProfileUserId, closeFriendProfile } = useFriendContext()

    return (
        <FriendProfileModal
            isOpen={!!selectedProfileUserId}
            userId={selectedProfileUserId}
            onClose={closeFriendProfile}
        />
    )
}

// Main wrapper component
export default function FriendWrapper({ children }: { children: React.ReactNode }) {
    return (
        <FriendProvider>
            {children}
            <FriendProfileModalWrapper />
        </FriendProvider>
    )
}
