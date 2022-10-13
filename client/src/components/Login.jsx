
export default function Login({ setUsername, onUsernameSelection }) {

    return (
        <div className='flex flex-col items-center mt-20'>
            <input className='textarea textarea-secondary w-5/12' placeholder='Enter username' onChange={(e) => setUsername(e.target.value)} onKeyPress = {(event) => {if (event.key == 'Enter') {onUsernameSelection()}}}></input>
            <button className='btn mt-4 h-10 text-xs' onClick={onUsernameSelection}>Submit</button>
        </div>
    )
}