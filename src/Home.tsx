export default function Home() {
  return (
    <div className='w-screen h-screen flex justify-center items-center bg-slate-500 text-white bold text-3xl'>
      <a href='/btc'>
        <div className='text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 cursor-pointer'>
          BITCOIN
        </div>
      </a>
      <a href='/eth'>
        <div className='text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 cursor-pointer'>
          ETHEREM
        </div>
      </a>
    </div>
  );
}
