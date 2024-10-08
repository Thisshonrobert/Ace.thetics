'use client'
import { motion } from "framer-motion";
import Image from 'next/image'
import { Dispatch, SetStateAction, useState } from "react";
import { IconType } from "react-icons";
import {
    FiChevronDown,
    FiChevronsRight,
    FiDollarSign,
    FiHeart,
    FiShoppingBag,
    FiShoppingCart,
    FiStar
} from "react-icons/fi";
import { SiNike } from "react-icons/si";
type ToggleCloseProps = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
  };


  type OptionProps = {
    Icon: IconType;
    title: string;
    selected: string;
    setSelected: Dispatch<SetStateAction<string>>;
    open: boolean;
    notifs?: number;
  };  


  export const Sidebar = () => {
    const [open, setOpen] = useState(true);
    const [selected, setSelected] = useState("Dashboard");
  
    return (
      <motion.nav
        layout
        className="fixed top-3 left-0 h-screen border-r border-slate-300 bg-white p-2 pt-3" // Changed to fixed and set left to 0
        style={{
          width: open ? "225px" : "fit-content",
        }}
      >
        <TitleSection open={open} />
  
        <div className="space-y-1">
          <Option
            Icon={FiStar}
            title="Stars"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={FiDollarSign}
            title="Offers"
            selected={selected}
            setSelected={setSelected}
            open={open}
            notifs={3}
          />
          <Option
            Icon={FiHeart}
            title="Liked"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={FiShoppingCart}
            title="WishList"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={FiShoppingBag}
            title="Products"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={SiNike}
            title="Brands"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
        </div>
  
        <ToggleClose open={open} setOpen={setOpen} />
      </motion.nav>
    );
  };
  

const Option = ({ Icon, title, selected, setSelected, open, notifs }:OptionProps) => {
  return (
    <motion.button
      layout
      onClick={() => setSelected(title)}
      className={`relative flex h-10 w-full items-center rounded-md transition-colors ${selected === title ? "bg-indigo-100 text-indigo-800" : "text-slate-500 hover:bg-slate-100"}`}
    >
      <motion.div
        layout
        className="grid h-full w-10 place-content-center text-lg"
      >
        <Icon />
      </motion.div>
      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.125 }}
          className="text-xs font-medium"
        >
          {title}
        </motion.span>
      )}

      {notifs && open && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          style={{ y: "-50%" }}
          transition={{ delay: 0.5 }}
          className="absolute right-2 top-1/2 size-4 rounded bg-indigo-500 text-xs text-white"
        >
          {notifs}
        </motion.span>
      )}
    </motion.button>
  );
};


const TitleSection = ({ open }: any) => {
  return (
    <div className="mb-3 border-b border-slate-300 pb-3">
      <div className="flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-slate-100">
        <div className="flex items-center gap-2">
          {/* Image Component from next/image */}
          <Image
            src="/Acethetics.png"   // Path to your image
            alt="Ace.Thetics logo"   // Alternative text for accessibility
            width={40}               // Width of the image in pixels
            height={40}              // Height of the image in pixels
            className="rounded-md"    // Add any styles you need
          />
          
          {open && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.125 }}
            >
              <span className="block text-xs font-semibold">Ace.Thetics</span>
              <span className="block text-xs text-slate-500">Livi'n Style</span>
            </motion.div>
          )}
        </div>
        {open && <FiChevronDown className="mr-2" />}
      </div>
    </div>
  );
};



const ToggleClose = ({ open, setOpen }:ToggleCloseProps) => {
  return (
    <motion.button
      layout
      onClick={() => setOpen((pv) => !pv)}
      className="absolute bottom-0 left-0 right-0 border-t border-slate-300 transition-colors hover:bg-slate-100"
    >
      <div className="flex items-center p-2">
        <motion.div
          layout
          className="grid size-10 place-content-center text-lg"
        >
          <FiChevronsRight
            className={`transition-transform ${open && "rotate-180"}`}
          />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-xs font-medium"
          >
            Hide
          </motion.span>
        )}
      </div>
    </motion.button>
  );
};