import { useContext } from 'react'
import { useState, useEffect } from 'react'
import { UserContext } from '../UserContext'

export default function Chat({ socket, user}) {
    const [privateMessage, setPrivateMessage] = useState('')
    const {userList, setUserlist} = useContext(UserContext)

    const sendPrivateMessage = (event) => {
        event.preventDefault()
        setUserlist(current => 
            current.map(usr => {
            if (usr.username == user) {
                usr.messages.push({content: privateMessage, fromSelf: true})
                socket.emit('private message', {content: privateMessage, to: usr.userID})
                return usr
            }
            return usr
            })
        )
        setPrivateMessage('')
    }    

    const messageList = () => {
        const userMessages = []
        userList.forEach(usr => {
            if (usr.username == user) {
                usr.messages.forEach(msg => userMessages.push(<li className={`my-1 ${msg.fromSelf && 'self-end'}`}><div className={ `badge p-4 ${msg.fromSelf ? 'badge-secondary' : 'badge-primary'}`}>{msg.content}</div></li>))
            }
        })
        return userMessages
    }

    return (
        <div className='flex flex-col items-center'>
            <div className="card w-96 h-80 bg-base-100 shadow-lg mt-20">
                <div className="card-body">
                    <ul className='flex flex-col'>{messageList()}</ul>
                </div>
            </div>

            <form className='flex flex-col w-10/12 self-end' onSubmit={sendPrivateMessage}>
                <input className="textarea textarea-primary mt-10 w-full h-42" type = 'text' placeholder="Write a message" id='privatemessage' name='privatemessage' value={privateMessage} onKeyPress = {(event) => {if (event.key == 'Enter') {sendPrivateMessage}}} onChange = {(e) => {setPrivateMessage(e.target.value)}}></input>
                <button className='btn mt-4 self-end' type='submit'>Send</button>
            </form>
        
        </div>
    )
}

