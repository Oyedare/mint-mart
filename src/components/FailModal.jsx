/* eslint-disable react/prop-types */
const FailModal = ({setShowFailureModal}) => {
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className=" absolute top-4 right-0 min-h-screen">
            {/* <div className="rounded-lg shadow-lg p-6 w-full max-w-md"> */}
              <div className="bg-red-100 w-full max-w-md border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-700">
                      There was an error minting your NFT. Please try again.
                    </p>
                    <p className="text-sm text-black underline cursor-pointer" onClick={()=>setShowFailureModal(false)}>Close</p>
                  </div>
                </div>
              </div>
            {/* </div> */}
          </div>
        </div>
  )
}

export default FailModal