import Circle from "./Circle"

export default function Header({ username }) {
    return(
        <div className="flex flex-col items-center py-4">
            <div className='badge badge-primary'>{username}</div>
            <Circle size={"64"} color={"#FF7AC6"}/>

        </div>
    )
}