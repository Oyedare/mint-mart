/* eslint-disable react/prop-types */

const SuccessModal = ({setShowSuccessModal}) => {
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="absolute top-4 right-0 min-h-screen">
            {/* <div className="bg-white rounded-lg shadow-lg p-6 "> */}
                <div className="bg-green-100 w-full max-w-md border-l-4 border-green-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                            className="h-5 w-5 text-green-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="font-medium text-green-800">Success!</p>
                            <p className="text-sm text-green-700">
                            Your NFT has been successfully minted.
                            </p>
                            <p className="text-sm text-black underline cursor-pointer" onClick={()=>setShowSuccessModal(false)}>close</p>
                        </div>
                    </div>
                </div>
            {/* </div> */}
        </div>
    </div>
  )
}

export default SuccessModal