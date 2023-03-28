interface ErrorProps {
  message: string;
}

const Error = ({ message }: ErrorProps) => {
  return (
    <div className="flex justify-center">
      <p className="text-red-400 text-lg font-medium">{message}</p>
    </div>
  )
}

export default Error
