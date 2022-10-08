/*  TODO
--online/offline icon for each user
--ntransition animations
--add alert for new messages, display number of messages from user
--profile pic/icon/avatar
--mobile design

--persistant messages
--chat history using db
--group messenging

*/

import { useState, useEffect, createContext } from 'react'
import './App.css'
// import io from 'socket.io-client'
import './assets/ellipse.svg'
import Chat from './components/Chat.jsx'
import Circle from './components/Circle'
import { UserContext } from './UserContext'
import socket from './socket'


function App() {
  const [usernameSelected, setUsernameSelected] = useState(false)
  const [username, setUsername] = useState('')  
  const [userList, setUserlist] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  
  let sessionID = localStorage.getItem('sessionID')
  if (sessionID == 'undefined') {sessionID = undefined}
  // console.log(sessionID)
  // console.log(usernameSelected)
  // console.log(socket)
  console.log(userList)

  function onUsernameSelection(event) {
    setUsernameSelected(true)
    socket.auth = { username }
    localStorage.setItem('username', username)
    socket.connect()
    console.log('onusernameselection called')
  }

  useEffect(() => {
    if (sessionID) {
      socket.auth = { sessionID }
      // console.log(socket.auth)
      socket.username = localStorage.getItem('username')
      setUsername(socket.username)
      socket.connect()
      setUsernameSelected(true)
      console.log('if sessionID called')
    }
  }, [])

  useEffect(() => {
    // socket.on("connect_error", (err) => {
    //   if (err.message === "invalid username") {
    //     setUsernameSelected(false)
    //   }
    //   console.log('username error')
    // });
    // console.log('useEffect runs')

    socket.on('users', (users) => {
      // console.log(users)
      users.forEach((user) => {
        user.self = user.userID === socket.userID
        user.messages.forEach((message) => {
          message.fromSelf = message.from === socket.userID
        })
        setUserlist(prev => [...prev, user])
      })
    })

    socket.on('user connected', (user) => {
      setUserlist(current => {
        console.log(current)
        let existingUser = current.find(usr => usr.userID == user.userID)
        console.log(existingUser)
        if (!existingUser) {return [...current, user]}
        else {
          console.log('update user')
          return current.map(usr => 
            {if (usr.userID == user.userID) [
              usr.connected = true]
              return usr
            }
          )
        }
      })   
      }
    )

    socket.on('user disconnected', (userID) => {

      setUserlist(current =>
        current.map(usr => {
          if (usr.userID == userID) {
            usr.connected = false
            return usr
            // console.log('set user to disconnected' + usr)
          }
          return usr
        }))
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
    // localStorage.setItem('userID', userID)
    console.log('session recieved from server ' + sessionID)
  })
    
    return () => {
      socket.off('connect_error')
      socket.off('user connected')
      socket.off('user disconnected')
      socket.off('users')
      socket.off('private message')
      socket.off('session')
    };

  }, [])

  const handleUsernameClick = (event) => {
    setSelectedUser(event.target.innerText)
  }

  const users = userList.map(user => (!user.self & user.connected) && 
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
