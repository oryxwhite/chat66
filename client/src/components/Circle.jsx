export default function Circle({ size, color }) {
    return(
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="16" stroke={color} strokeWidth="5"/>
        </svg>
    )
}