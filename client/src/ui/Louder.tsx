// import "./louder.css"

const Loader = () => (
  // <div className="flex flex-col items-center justify-center py-10">
  //   <div className="loader mb-4"></div>
  // </div>
     <div className="p-8 bg-white rounded-2xl  border border-gray-100 text-center">
                <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading...</p>
            </div>
);

export default Loader;