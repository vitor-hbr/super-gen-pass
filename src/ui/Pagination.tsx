import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const items = [
    {
        id: 1,
        title: "Back End Developer",
        department: "Engineering",
        type: "Full-time",
        location: "Remote",
    },
    {
        id: 2,
        title: "Front End Developer",
        department: "Engineering",
        type: "Full-time",
        location: "Remote",
    },
    {
        id: 3,
        title: "User Interface Designer",
        department: "Design",
        type: "Full-time",
        location: "Remote",
    },
];

export default function Example() {
    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <a
                    href="#"
                    className="text-sm relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                    Previous
                </a>
                <a
                    href="#"
                    className="text-sm relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                    Next
                </a>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">1</span> to{" "}
                        <span className="font-medium">10</span> of{" "}
                        <span className="font-medium">97</span> results
                    </p>
                </div>
                <div>
                    <nav
                        className="-space-x-px isolate inline-flex rounded-md shadow-sm"
                        aria-label="Pagination"
                    >
                        <a
                            href="#"
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Previous</span>
                            <FaArrowLeft
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                        </a>
                        <a
                            href="#"
                            aria-current="page"
                            className="text-sm relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 font-semibold text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            1
                        </a>
                        <a
                            href="#"
                            className="text-sm relative inline-flex items-center px-4 py-2 font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            2
                        </a>
                        <a
                            href="#"
                            className="text-sm relative hidden items-center px-4 py-2 font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
                        >
                            3
                        </a>
                        <span className="text-sm relative inline-flex items-center px-4 py-2 font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                            ...
                        </span>
                        <a
                            href="#"
                            className="text-sm relative hidden items-center px-4 py-2 font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
                        >
                            8
                        </a>
                        <a
                            href="#"
                            className="text-sm relative inline-flex items-center px-4 py-2 font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            9
                        </a>
                        <a
                            href="#"
                            className="text-sm relative inline-flex items-center px-4 py-2 font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            10
                        </a>
                        <a
                            href="#"
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Next</span>
                            <FaArrowRight
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                        </a>
                    </nav>
                </div>
            </div>
        </div>
    );
}
