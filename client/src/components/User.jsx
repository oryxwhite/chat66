import Circle from './Circle'
import { useState } from 'react'

export default function User({ user, selectedUser }) {
    const [newMessage, setNewMessage] = useState(0)

    return (
    <>
        <li className='mb-4' key={user.userID}>
            <a className={`${selectedUser == user.username ? "active" : ""}`}>
                <Circle size={"32"} color={user.connected ? "#52FA7C" : "#373740"} />
                {user.username}
                {user.hasNewMessages && <div className="badge ml-auto badge-accent self-center justify-self-enter"></div>}
            </a>
        </li>
        

    </>
    )
}