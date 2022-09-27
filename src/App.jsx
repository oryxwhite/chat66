/*  TODO
--alert when user connected
--remove user from list on disconnect
--private messaging
    --conditionally render chat display and input form
    --sendPrivateMessage function
    --recieve private message and push to messages array in user object
--persistant id using sessions and local storage
--chat history using db
*/

import { useState, useEffect } from 'react'
import './App.css'
import io from 'socket.io-client'
import './assets/ellipse.svg'

const socket = io('http://localhost:3000', { autoConnect: false })

function App() {
  const [usernameSelected, setUsernameSelected] = useState(false)
  const [username, setUsername] = useState('')  
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [id, setId] = useState()
  const [message, setMessage] = useState('')
  const [serverMessages, addServerMessage] = useState([])
  const [userList, setUserlist] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

  function onUsernameSelection(event) {
    setUsernameSelected(true)
    socket.auth = { username }
    socket.connect()
  }

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      setId(socket.id)
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('chat message', (msg) => {
      addServerMessage((prev) => [...prev, msg])
    })

    socket.on("connect_error", (err) => {
      if (err.message === "invalid username") {
        setUsernameSelected(false)
      }
      console.log('username error')
    });

    socket.on('users', (users) => {
      users.forEach((user) => {
        user.self = user.userID === socket.id
        setUserlist(prev => [...prev, user])
      })
    })

    socket.on('user connected', (user) => {
      setUserlist(prev => [...prev, user])
    })
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chat message')
      socket.off('connect_error')
      socket.off('user connected')
      socket.off('users')
    };

  }, [usernameSelected])

  const sendMessage = (event) => {
    event.preventDefault()
    socket.emit('chat message', username + ":  " + message)
    setMessage('')
  }

  const handleUsernameClick = (event) => {
    setSelectedUser(event.target.innerText)
  }

  const sendPrivateMessage = () => {
    return
  }

  const messageList = serverMessages.map(msg => <li key={msg}>{msg}</li>)
  const users = userList.map(user => !user.self && <li key={user.userID}><a>{user.username}</a></li>)

  //usernameSelected controls whether the username input form or the chat is displayed
  return (
    <>
      {!usernameSelected ? (
        <div className='flex flex-col items-center mt-20'>
          <input className='textarea textarea-secondary w-5/12' placeholder='Enter username' onChange={(e) => setUsername(e.target.value)} onKeyPress = {(event) => {if (event.key == 'Enter') {onUsernameSelection()}}}></input>
          <button className='btn mt-4 h-10 text-xs' onClick={onUsernameSelection}>Submit</button>
        </div>

      ) : (

        <div className='flex flex-col items-center mt-20 h-full'>
          {selectedUser && <div></div>}
          <div>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="16" stroke="#373140" stroke-width="5"/>
            </svg>
          </div>
        
          <ul className="menu bg-base-100 w-56 shadow-xl mt-10" onClick={handleUsernameClick}>
            {users}
          </ul>

          <div className="card w-96 bg-base-100 shadow-xl mt-20">
            <div className="card-body">
              <ul>{messageList}</ul>

            </div>
          </div>

          <form className='flex flex-col w-6/12 justify-self-end' onSubmit={sendMessage}>
            <input className="textarea textarea-primary mt-10 w-full h-42" type = 'text' placeholder="Write a message" id='message' name='message' value={message} onKeyPress = {(event) => {if (event.key == 'Enter') {sendMessage()}}} onChange = {(e) => {setMessage(e.target.value)}}></input>
            <button className='btn mt-4 self-end' type='submit'>Send</button>
          </form>

        </div> 

      )}
    </>
  )
}

export default App
