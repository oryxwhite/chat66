export default function Test({ test, setTest}) {
    function handleClick() {
        setTest(prev => prev += 1)
    }
    return(
        <div>
            <p>{test}</p>
            <button className="btn" onClick={handleClick}>change test variable</button>
        </div>
    )
}