import FaucetModal from "./FaucetModal";
import Header from "./Header";
import NavigationTabs from "./NavigationTabs";

const Layout: React.FC<any> = ({ children }) => {
  return (
    <>
      <Header />
      <div className="">
        <div className="flex justify-between">
          <div className="w-[20%]">
            <NavigationTabs />
          </div>
          <div className="w-[80%] h--[89vh]">{children}</div>
        </div>
        <FaucetModal />
      </div>
    </>
  );
};
export default Layout;
