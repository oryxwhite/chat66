import { useContext } from "react"
import { UserContext } from "../UserContext"
import User from "./User"

export default function UserList({ selectedUser, handleUsernameClick }) {
    const {userList} = useContext(UserContext)
    const users = userList.map(user => (!user.self) && <User user={user} selectedUser={selectedUser}/>)

    return (
        <>
            <ul className="menu p-2 mr-10 rounded-box bg-base-200 w-56 h-[360px] shadow-lg mt-10 overflow-y-auto" onClick={handleUsernameClick}>
              <li className="menu-title my-2">
                <span>Friends</span>
              </li>
              {users}
            </ul>
        </>
    )
}