import { ConnectButton } from "@rainbow-me/rainbowkit";

import ThemeSwitch from "./ThemeSwitch";

const Header: React.FC = () => {
  return (
    <>
      <div className="sticky top-0 z-50 flex flex-col items-start ">
        <div className="navbar bg-base-100  shadow-sm">
          <div className="navbar-start">
            <a className="text-sm normal-case btn btn-ghost lg:text-xl">
              <span className="m-2 text-primary">DOmagle Chat</span>
              <a
                href="https://github.com/Naim-Bijapure/scaffold-eth-next"
                target={"_blank"}
                className="text-xs  link link-secondary"
                rel="noreferrer">
                (built with scaffold-eth-next-2.0 )
              </a>
            </a>
          </div>

          <div className="hidden navbar-center lg:flex"></div>
          <div className="navbar-end">
            <div className="mx-5">
              <ConnectButton
                // chainStatus={"name"}
                accountStatus={{
                  smallScreen: "avatar",
                  largeScreen: "full",
                }}
                showBalance={{
                  smallScreen: false,
                  largeScreen: true,
                }}
              />
            </div>
            <ThemeSwitch />
          </div>
        </div>

        {/* navigatin menu tabs  */}
        {/* <NavigationTabs /> */}
      </div>
    </>
  );
};
export default Header;
