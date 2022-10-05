/*  TODO
--alert when user connected, transition animations
--add alert for new messages, display number of messages from user
--profile pic/icon/avatar
--refactor on 'chat message', messageList, sendMessage to group messenging
--mobile design
--persistant id using sessions and local storage
  --online/offline icon for each user
--chat history using db
*/

import { useState, useEffect, createContext } from 'react'
import './App.css'
import io from 'socket.io-client'
import './assets/ellipse.svg'
import Chat from './components/Chat.jsx'
import Circle from './components/Circle'
import { UserContext } from './UserContext'
// import Test from './components/Test'

const socket = io(import.meta.env.VITE_SERVER_IP, { autoConnect: false })
const sessionID = localStorage.getItem('sessionID')

function App() {
  const [usernameSelected, setUsernameSelected] = useState(false)
  const [username, setUsername] = useState('')  
  // const [isConnected, setIsConnected] = useState(socket.connected);
  // const [id, setId] = useState()
  const [message, setMessage] = useState('')
  const [serverMessages, addServerMessage] = useState([])
  const [userList, setUserlist] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  // const [test, setTest] = useState(1)
  console.log(usernameSelected)
  console.log(sessionID)
  console.log(socket)


  function onUsernameSelection(event) {
    setUsernameSelected(true)
    socket.auth = { username }
    socket.connect()
    console.log('onusernameselection called')
  }

  useEffect(() => {
    if (sessionID != 'undefined') {
      setUsernameSelected(true)
      socket.auth = { sessionID }
      socket.connect()
      console.log('if sessionID called')
    }
  }, [])

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

    // socket.on("connect_error", (err) => {
    //   if (err.message === "invalid username") {
    //     setUsernameSelected(false)
    //   }
    //   console.log('username error')
    // });

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

  socket.on("session", ({ sessionID, userID }) => {
    // attach the session ID to the next reconnection attempts
    socket.auth = { sessionID }
    // store it in localStorage
    localStorage.setItem('sessionID', sessionID)
    // save the ID of the user
    socket.userID = userID
    
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

  // const messageList = serverMessages.map(msg => <li key={msg}>{msg}</li>)
  const users = userList.map(user => !user.self && 
    <li className='mb-4' key={user.userID}>
    <a className={selectedUser == user.username ? "active" : ""}>
    <Circle size={"32"} color={"#373740"} />
    {user.username}</a></li>)


  //usrnameSelected controls whether the username input form or the chat is displayed
  return (
    <UserContext.Provider value={{ userList, setUserlist }}>
      {!usernameSelected ? (
        <div className='flex flex-col items-center mt-20'>
          <input className='textarea textarea-secondary w-5/12' placeholder='Enter username' onChange={(e) => setUsername(e.target.value)} onKeyPress = {(event) => {if (event.key == 'Enter') {onUsernameSelection()}}}></input>
          <button className='btn mt-4 h-10 text-xs' onClick={onUsernameSelection}>Submit</button>
        </div>

      ) : (

        <div className='flex flex-col items-center mt-1 0 h-full p-10 w-8/12 m-auto rounded-3xl'>
          <div className='badge badge-primary'>{username}</div>
          <Circle size={"64"} color={"#FF7AC6"}/>
          {/* <Test setTest={setTest} test={test}/> */}
          <div className='flex'>
            <ul className="menu p-2 mr-10 rounded-box bg-base-200 w-56 h-[360px] shadow-lg mt-10" onClick={handleUsernameClick}>
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
