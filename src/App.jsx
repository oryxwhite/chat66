/*  TODO
--alert when user connected
--username Component
--display messages from self differently
--refactor on 'chat message', messageList, sendMessage to group messenging
--persistant id using sessions and local storage
--chat history using db
*/

import { useState, useEffect, createContext } from 'react'
import './App.css'
import io from 'socket.io-client'
import './assets/ellipse.svg'
import Chat from './components/Chat.jsx'
import { UserContext } from './UserContext'

const socket = io('http://localhost:3000', { autoConnect: false })

function App() {
  const [usernameSelected, setUsernameSelected] = useState(false)
  const [username, setUsername] = useState('')  
  // const [isConnected, setIsConnected] = useState(socket.connected);
  // const [id, setId] = useState()
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
    // socket.on('connect', () => {
    //   setIsConnected(true);
    //   setId(socket.id)
    // });

    // socket.on('disconnect', () => {
    //   setIsConnected(false);
    // });

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

    socket.on('user disconnected', (ID) => {
      console.log(ID)
      setUserlist(current => 
        current.filter(usr => usr.userID !== ID)
      )
    })

    socket.on('private message', ({ content, from}) => {
      console.log(content, from)
      setUserlist(current =>
          current.map(usr => {
              if (usr.userID == from) {
                  usr.messages.push({ content, fromSelf: false})
                  //TODO: add hasNewMessages flag
                  return usr
              }
              return usr
          })    
      )
  })
    
    return () => {
      // socket.off('connect');
      // socket.off('disconnect');
      socket.off('chat message')
      socket.off('connect_error')
      socket.off('user connected')
      socket.off('users')
      socket.off('private message')
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

  const messageList = serverMessages.map(msg => <li key={msg}>{msg}</li>)
  const users = userList.map(user => !user.self && 
    <li className='mb-4' key={user.userID}>
    <a className={selectedUser == user.username ? "active" : ""}>
    <svg width="30" height="30" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="16" stroke="#272935" strokeWidth="5"/>
    </svg>
    {user.username}</a></li>)

  console.log(userList)

  //usernameSelected controls whether the username input form or the chat is displayed
  return (
    <UserContext.Provider value={{ userList, setUserlist }}>
      {!usernameSelected ? (
        <div className='flex flex-col items-center mt-20'>
          <input className='textarea textarea-secondary w-5/12' placeholder='Enter username' onChange={(e) => setUsername(e.target.value)} onKeyPress = {(event) => {if (event.key == 'Enter') {onUsernameSelection()}}}></input>
          <button className='btn mt-4 h-10 text-xs' onClick={onUsernameSelection}>Submit</button>
        </div>

      ) : (

        <div className='flex flex-col items-center mt-20 h-full'>
          <div className='badge badge-primary'>{username}</div>

          <div>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="16" stroke="#FF7AC6" strokeWidth="5"/>
            </svg>
          </div>
          <div className='flex'>
          <ul className="menu p-2 mr-10 rounded-box bg-base-100 w-56 h-[360px] shadow-xl mt-10" onClick={handleUsernameClick}>
            <li className="menu-title my-2">
              <span>Friends</span>
            </li>
            {users}
          </ul>
          
          {selectedUser && <Chat socket={socket} user={selectedUser} />}
          </div>
        </div> 

      )}
    </UserContext.Provider>
  )
}

export default App
