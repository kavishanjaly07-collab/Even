import AnnouncementBar from "./AnnouncementBar/AnnouncementBar";
import Navbar from "./Navbar/Navbar";
import Hero from "./Hero/Hero";
import SearchBar from "./SearchBar/SearchBar";
import Categories from "./Categories/Categories";
import Howitworks from "./Howitworks/Howitworks";
// import Login from "./Login/Login";
import Footer from "./Footer/Footer";
import PopularServices from "./PopularServices/PopularServices";
import Categoryheader from "./Categoryheader/Categoryheader";
import ProviderCards from "./ProviderCards/ProviderCards";
import Payment from "./Payment/Payment";
// import  Dashboard  from "./Dashboard/Dashboard";


export default function Home() {
  return (
    <>
      <AnnouncementBar />
       <Navbar />
      <main >
      <Hero />
      <SearchBar /> 
      <Categories />
      <PopularServices/>
      <Howitworks/>
      </main> 
      <Footer /> 
   
      <Categoryheader/>
      <ProviderCards/>
      <Payment/> 

       
    </>
  );
}
