import { useEffect, useState } from "react";
import { FaBars, FaTimes, FaSearch, FaPlus, FaBell, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../images/logo2.png";
import Input from "./Input";
import Button from "./Button";
import { getUserInitials } from "../utils/userInitials";
import { useAuth } from "../features/auth/AuthContext";

const Header = ({ onSearch }: { onSearch?: (text: string) => void }) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const { currentUser , mutate} = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        onSearch?.(value);
    };

    useEffect(()=>{
        mutate();
    },[]);

    return (
       <div className="mb-3 sticky top-1 z-50 shadow p-2 rounded-lg bg-white bg-opacity-65">
    <header className="pl-5 pr-5">
        <div className="flex items-center justify-between">
            {/* Logo - Left */}
            <div className="flex items-center">
                <img src={logo} alt="logo" className="w-44" />
            </div>

            {/* Search & Links - Center */}
            <div className="hidden [@media(min-width:850px)]:flex items-center gap-6">
                <Input
                    value={searchValue}
                    onChange={handleChange}
                    placeholder="Search projects, freelancers, posts..."
                    variant="search"
                    icon={<FaSearch className="text-text-gray" />}
                    className=""
                />
                
                <div className="flex flex-row gap-4">
                    <Link to="/CreatePost" className="flex items-center gap-2 text-brand-blue text-sm font-medium hover:underline">
                        <FaPlus /> Add post
                    </Link>

                    <Link to="/notifications" className="flex items-center gap-2 text-brand-blue text-sm font-medium hover:underline">
                        <FaBell /> Notifications
                    </Link>

                    <Link to="/messages" className="flex items-center gap-2 text-brand-blue text-sm font-medium hover:underline">
                        <FaEnvelope /> Messages
                    </Link>
                </div>
            </div>

            {/* Profile & Mobile Menu - Right */}
            <div className="flex items-center gap-4">
                {/* Profile Button - Desktop only */}
                <Link
                    className="hidden [@media(min-width:850px)]:flex w-14 h-10 rounded-full bg-gradient-to-r from-brand-blueLight to-brand-blue items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer"
                    to="/profile"
                >
                    {currentUser ? getUserInitials(currentUser.firstname, currentUser.lastname) : "?"}
                </Link>

                {/* Mobile menu button */}
                <Button
                    variant="icon"
                    icon={<FaBars className="text-xl" />}
                    onClick={() => setOpen(true)}
                    className="block [@media(min-width:850px)]:hidden"
                />
            </div>
        </div>
  

                {/* Mobile sidebar menu */}
                {open && (
                    <div className="fixed inset-0 z-50 flex [@media(min-width:850px)]:hidden">
                        <div className="relative bg-brand-whiteHeader w-3/4 max-w-xs shadow-xl p-6 z-50">
                            <Button
                                variant="icon"
                                icon={<FaTimes className="text-xl" />}
                                onClick={() => setOpen(false)}
                                className="absolute top-4 right-4"
                                aria-label="Close menu"
                            />

                            <ul className="mt-10 space-y-6 text-lg font-medium text-brand-blue">
                                <div className="flex flex-row justify-between mt-4">
                                    <img src={logo} alt="logo" className="w-40 h-8 mt-2" />
                                    <div className="mt-1 w-10 h-10 rounded-full bg-gradient-to-r from-brand-blueLight to-brand-blue flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer">
                                        {currentUser ? getUserInitials(currentUser.firstname, currentUser.lastname) : "?"}
                                    </div>
                                </div>

                                <li>
                                    <Link to="/CreatePost" className="flex items-center gap-2">
                                        <FaPlus /> <span>Add post</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/notifications" className="flex items-center gap-2">
                                        <FaBell /> <span>Notifications</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/messages" className="flex items-center gap-2">
                                        <FaEnvelope /> <span>Messages</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </header>

            {/* Mobile search */}
            <div className="pl-2 pr-2 flex [@media(min-width:850px)]:hidden">
                <Input
                    value={searchValue}
                    onChange={handleChange}
                    placeholder="Search projects, freelancers, posts..."
                    variant="search"
                    icon={<FaSearch className="text-text-gray" />}
                    className="w-80"
                />
            </div>
        </div>
    );
};

export default Header;
