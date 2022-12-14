import Link from "next/link";
import { useRouter } from "next/router";
import { FaRandom, FaRocketchat } from "react-icons/fa";
import { BsViewList } from "react-icons/bs";
import { VscDebugAll } from "react-icons/vsc";

/** ----------------------
* add new tab here
* ---------------------*/

const navigationTabs = [
	{ tabName: "Random Chat", pageName: "/", icon: <FaRandom /> },
	{ tabName: "Direct Chat", pageName: "/DirectChat", icon: <FaRocketchat /> },
	// { tabName: "Group Chat", pageName: "/groupChat", icon: <BsViewList /> },
	// { tabName: "Debug Contracts", pageName: "/Debug", icon: <VscDebugAll /> },
	// { tabName: "Example UI", pageName: "/ExampleUI", icon: <BsViewList /> },
	// { tabName: "Hints", pageName: "/Hints", icon: <AiOutlineBulb /> },
	// { tabName: "Subgraph", pageName: "/Subgraph" },
	// { tabName: "Mainnet Dai", pageName: "/MainnetDai" },
	// { tabName: "Help", pageName: "/Help", icon: <AiOutlineInfoCircle /> },
];

const NavigationTabs: React.FC = () => {
  const { pathname } = useRouter();

  return (
    <>
      <div className="hidden m-2 md:block sticky top-20">
        <ul className="flex flex-col justify-center menu menu-horizontal bg-base-100 rounded-box">
          {navigationTabs.map((tab) => {
            return (
              <li
                className={`${pathname === tab.pageName ? "bordered  " : "tooltip-info"}`}
                data-tip={tab.tabName}
                key={tab.tabName}>
                <Link href={tab.pageName}>
                  <a className="text--xs">
                    <span>{tab.icon ? tab.icon : ""}</span>
                    <span>{tab.tabName}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {/* mobile navigation */}
      <div className="mr-auto dropdown md:hidden w-96">
        <label tabIndex={0} className="btn btn-ghost lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </label>

        <ul className="p-2 mt-3 shadow menu menu-compact dropdown-content bg-base-100 rounded-box">
          {navigationTabs.map((tab) => {
            return (
              <li
                className={`${pathname === tab.pageName ? "" : "tooltip tooltip-info"}`}
                data-tip={tab.tabName}
                key={tab.tabName}>
                <Link href={tab.pageName}>
                  <a>
                    <span>{tab.icon ? tab.icon : ""}</span>
                    <span>{tab.tabName}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};
export default NavigationTabs;
