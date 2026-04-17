import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMember } from "./context/MemberContext";
import { toast } from 'react-toastify';

import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { MemberProvider } from './context/MemberContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

import Header from './components/Header/Header'
import Header_Menu from './components/Header/Header_Menu'
import Main_Image from './components/Main/Main_Image'
import Login from './components/Login/Login'
import Join from './components/Login/Join'
import Join_success from './components/Login/Join_success'
import Find_Id from './components/Login/Find_Id'
import Find_Id_success from './components/Login/Find_Id_success'
import Find_Pwd from './components/Login/Find_Pwd'
import Find_Pwd_success from './components/Login/Find_Pwd_success'
import Main from './components/Main/Main'
import Main_Itmes from './components/Main/Main_Items'
import Main_Introduce from './components/Main/Main_Introduce'
import Main_Event from './components/Main/Main_Event'
import Main_EventDetail from './components/Main/Main_EventDetail'
import None_Custom_Detail from './components/Product_Detail/None_Custom_Detail'
import Modify from './components/Member/Modify/Modify'
import ChangePwd from './components/Member/Modify/ChangePwd'
import OrderList from './components/Member/Order/OrderList' 
import WishList from './components/Member/Items/WishList'
import AddrList from './components/Member/Addr/AddrList'
import AddrModify from './components/Member/Addr/AddrModify'
import AddrRegister from './components/Member/Addr/AddrRegister'
import Member_Sidebar from './components/Member/Member_Sidebar'
import Cart from './components/Member/Items/Cart'
import OrderForm from './components/Order/OrderForm'
import OrderComplete from './components/Order/OrderComplete'
import OrderDetail from './components/Member/Order/OrderDetail'
import OrderTracking from './components/Member/Order/OrderTracking'
import ReviewWrite from './components/ProductDetailTabs/Review/ReviewWrite'
import Admin_Sidebar from './components/Admin/Admin_Sidebar'
import Order_Status from './components/Admin/Order_Status'
import ProductDetail from './components/ProductDetailTabs/Detail/ProductDetail'
import InquiryForm from './components/ProductDetailTabs/Inquiry/InquiryForm'
import MyInquiryList from './components/Member/Inquiry/InquiryList'
import CreditHistory from './components/Member/Credit/CreditHistory'
import SupportMain from './components/Support/SupportMain'
import SupportInquiryForm from './components/Support/SupportInquiryForm'
import SupportMyInquiryList from './components/Support/MyInquiryList'
import FaqMain from './components/Support/FaqMain'
import NoticeList from './components/Support/NoticeList'
import ReviewBoard from './components/Support/ReviewBoard'
import CustomFrames from './components/Main/Main_CustomFrames'
import BizOrderBoard from './components/Biz/BizOrderBoard'
import Biz_OrderWrite from './components/Biz/Biz_OrderWrite'
import Main_CompanyProfile from './components/Main/Main_CompanyProfile'
import MyRetouchList from './components/Member/Order/MyRetouchList'
import MemberHome from './components/Member/MemberHome'
// import LeasePage from './components/Lease/LeasePage'
import AuthorRegisterIntro from './components/Author/AuthorRegisterIntro'
import AuthorRegisterForm from './components/Author/AuthorRegisterForm'
import AuthorPage from './components/Author/AuthorPage'
import FloatingButtons from './components/Button/FloatingButtons'
import GuestOrderSearch from './components/Member/Order/GuestOrderSearch'
import LinkSocial from "./components/Member/Modify/LinkSocial"
import SearchResults from './components/Main/Main_SearchResults';
import Terms from './components/Policy/Terms';
import Privacy from './components/Policy/Privacy';

import Admin_InquiryList from './components/Admin/Admin_InquiryList'
import Admin_FAQManager from './components/Admin/Admin_FAQManager'
import Admin_NoticeManager from './components/Admin/Admin_NoticeManager'
import Admin_MemberManager from './components/Admin/Admin_MemberManager'
import Admin_ProductManager from './components/Admin/Admin_ProductManager'
import Admin_ReviewManager from './components/Admin/Admin_ReviewManager'
import Admin_CollectionManager from './components/Admin/Admin_CollectionManager'
import Admin_Order_Detail from './components/Admin/Order_Detail'
import Admin_EventManager from './components/Admin/Admin_EventManager'
import Admin_BizList from './components/Admin/Admin_BizList'
import Admin_BizView from './components/Admin/Admin_BizView'
// import Admin_Lease_Status from './components/Admin/Lease_Status'
import Admin_AuthorManager from './components/Admin/AuthorManager'
import Admin_RetouchList from './components/Admin/AdminRetouchList'


import Footer from './components/Footer/Footer'

// Admin
import Insert_Product from './components/Admin/Insert_Product'
import axios from 'axios';
import {
    consumeDocumentReloadOnce,
    clearMainItemsScrollSession,
    MAIN_ITEMS_SCROLL_PREFIX,
} from './utils/navigationReload';

const SEO_SITE_ORIGIN = 'https://diasec.co.kr';

function SeoMetaManager() {
    const location = useLocation();

    useEffect(() => {
        // 카테고리·맞춤액자는 각 화면의 Helmet(og·canonical 포함)에 맡김 — 여기서 덮어쓰면 충돌함
        if (location.pathname === '/main_Items' || location.pathname === '/customFrames') {
            return;
        }

        const origin = SEO_SITE_ORIGIN;
        const currentUrl = `${origin}${location.pathname}${location.search}`;

        const promoTitle = ' · 30% 오픈할인';
        const seoDefaults = {
            title: `디아섹코리아 | 30% 오픈할인`,
            description: '디아섹코리아에서 디아섹 액자와 맞춤 액자를 만나보세요. 작품과 사진에 맞춘 고급 액자 제작 서비스를 제공합니다.',
            canonical: `${origin}/`,
        };

        let seo = { ...seoDefaults, canonical: currentUrl };

        if (location.pathname === '/introduce') {
            seo = {
                title: `디아섹 액자 소개 | 디아섹코리아${promoTitle}`,
                description: '디아섹코리아의 디아섹 액자를 소개합니다. 선명한 발색과 고급스러운 마감의 아크릴 액자를 확인해보세요.',
                canonical: `${origin}/introduce`,
            };
        }

        document.title = seo.title;

        let descriptionTag = document.querySelector('meta[name="description"]');
        if (!descriptionTag) {
            descriptionTag = document.createElement('meta');
            descriptionTag.setAttribute('name', 'description');
            document.head.appendChild(descriptionTag);
        }
        descriptionTag.setAttribute('content', seo.description);

        let canonicalTag = document.querySelector('link[rel="canonical"]');
        if (!canonicalTag) {
            canonicalTag = document.createElement('link');
            canonicalTag.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalTag);
        }
        canonicalTag.setAttribute('href', seo.canonical);
    }, [location.pathname, location.search]);

    return null;
}

function ScrollToTop() {
    const location = useLocation();
    useEffect(() => {
        const restoreKey = `${MAIN_ITEMS_SCROLL_PREFIX}${location.pathname}${location.search}`;

        if (consumeDocumentReloadOnce()) {
            clearMainItemsScrollSession();
            window.scrollTo(0, 0);
            return;
        }

        if (location.pathname === "/main_Items" && sessionStorage.getItem(restoreKey) != null) {
            return;
        }
        window.scrollTo(0, 0);
    }, [location.pathname, location.search]);
    return null;
}

function Layout() {
    const location = useLocation();
    const path = location.pathname;
    const isItems = location.pathname === '/' || location.pathname === '/main_Items_Clock';
    const isMain = location.pathname === '/';

    const isMember = ['/modify', '/changePwd', '/orderList', '/orderDetail', '/orderList_Claim' , '/addrList', '/addrModify', '/myInquiryList', '/reviewWrite', '/supportInquiryForm',
                      '/addrRegister', '/wishList', '/creditHistory', '/orderTracking', '/mypage/retouch'].some(p => path.startsWith(p)) || path.startsWith('/addrModify/') || path.startsWith('/orderDetail');
    const isAdmin = path.startsWith('/admin');

    const extraPb = 
        path === "/none_custom_detail" ? "mb-[100px] md:mb-0"
        : path === "/customFrames" ? " mb-[50px] md:mb-0"
        : "";

    const navigate = useNavigate();
    const { setMember } = useMember();
    // 깃 테스트 완료

    useEffect(() => {
        const handler = async (e) => {
            // console.log("[GLOBAL message]", e.origin, e.data);

            if (e.origin !== window.location.origin) return;

            const { type, message } = e.data || {};

            if (type === "LINK_REQUIRED") {
                // 연결 화면으로 이동
                console.log("LINK_REQUIRED -> /link-social");
                navigate("/link-social");
                return;
            }

            if (type === "OAUTH_FAIL") {
                toast.error("소셜 로그인 실패");
                console.error("OAUTH_FAIL:", message);
                return;
            }

            if (type === "OAUTH_SUCCESS") {
                try {
                    const API = process.env.REACT_APP_API_BASE;
                    const api = axios.create({ baseURL: API, withCredentials: true});

                    const profile = await api.get(`/member/me`);
                    setMember(profile.data);
                    toast.success("로그인되었습니다.");
                    navigate("/");
                } catch (err) {
                    toast.error("로그인 정보를 불러오지 못했습니다.");
                    console.error(err);
                }
            }
        };

        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, [navigate, setMember]);

    return (
        <div className="w-full min-h-screen bg-white">
            {/* 우측하단 버튼 */}
            <FloatingButtons />

            {/* 헤더 */}
            <div className="sticky z-[9999] top-0 w-full bg-white">
                <div className="max-w-[2560px] h-[45px] mx-auto">
                    <Header />
                </div>
                <div className="hidden md:flex w-full h-[44px] mx-auto">
                    <Header_Menu />
                </div>
            </div>
            
            {isItems && (
                <div className="max-w-[2560px] max-h-[600px] mx-auto">
                    <Main_Image />
                </div>
            )}

            <div className={`
                max-w-[1300px] 
                min-h-[calc(100vh_-_150px)] 
                md:min-h-[calc(100vh_-_180px)] 
                lg:min-h-[calc(100vh_-_200px)] 
                xl:min-h-[calc(100vh_-_210px)] 
                mx-auto
            `}> 
                {isMain && (
                    <div className="
                        xl:mt-32
                        lg:mt-28
                        md:mt-24
                        mt-20">
                        
                    </div>
                )}

                {isAdmin ? (
                    <div className="flex flex-row mt-20">
                        <Admin_Sidebar />
                        <Outlet />
                    </div>
                ) : isMember ? (
                    <div className="flex flex-row mt-20">
                        <div className="hidden md:block shrink-0">
                            <Member_Sidebar />
                        </div>
                        <Outlet />
                    </div>
                ) : (
                    <Outlet />
                )}
            </div>

            <div className={`
                h-[240px] md:h-[220px] xl:h-[210px] 
                w-full bg-white ${extraPb}`}>
                <Footer />
            </div>
        </div>
    );
}

function App() {

    // 새로고침시 상단
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    return (
        <MemberProvider>
            <SeoMetaManager />
            <ScrollToTop />
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Main />}/>
                    <Route path="/userLogin" element={<Login />} />
                    <Route path="/join" element={<Join />} />
                    <Route path="/join_success" element={<Join_success />} />
                    <Route path="/find_Id" element={<Find_Id />} />
                    <Route path="/find_Id_success" element={<Find_Id_success />} />
                    <Route path="/find_Pwd" element={<Find_Pwd />} />
                    <Route path="/find_Pwd_success" element={<Find_Pwd_success />} />
                    <Route path="/modify" element={<Modify />} />
                    <Route path="/changePwd" element={<ChangePwd />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/orderList" element={<OrderList />} />
                    {/* <Route path="/orderList_Lease" element={<OrderList_Lease />} /> */}
                    <Route path="/orderDetail/:oid" element={<OrderDetail />} />
                    <Route path="/orderTracking/:itemId" element={<OrderTracking />} />
                    <Route path="/addrList" element={<AddrList />} />
                    <Route path="/addrModify/:cno" element={<AddrModify />} />
                    <Route path="/addrRegister" element={<AddrRegister />} />
                    <Route path="/wishList" element={<WishList />} />
                    <Route path="/none_custom_detail" element={<None_Custom_Detail/>} />
                    <Route path="/main_Items" element={<Main_Itmes/>} />
                    <Route path="/orderForm" element={<OrderForm/>} />
                    <Route path="/orderComplete" element={<OrderComplete/>} />
                    <Route path="/introduce" element={<Main_Introduce/>} />
                    <Route path="/mainEvent" element={<Main_Event/>} />
                    <Route path="/mainEventDetail/:id" element={<Main_EventDetail/>} />
                    <Route path="/reviewWrite" element={<ReviewWrite/>} />
                    <Route path="/inquiryForm" element={<InquiryForm/>} />
                    <Route path="/productDetail" element={<ProductDetail />} />
                    <Route path="/myInquiryList" element={<MyInquiryList />} />
                    <Route path="/creditHistory" element={<CreditHistory />} />
                    <Route path="/supportMain" element={<SupportMain />} />
                    <Route path="/supportInquiryForm" element={<SupportInquiryForm />} />
                    <Route path="/supportMyInquiryList" element={<SupportMyInquiryList />} />
                    <Route path="/faqMain" element={<FaqMain />} />
                    <Route path="/noticeList" element={<NoticeList />} />
                    <Route path="/reviewBoard" element={<ReviewBoard />} />
                    <Route path="/customFrames" element={<CustomFrames />} />
                    <Route path="/admin_InquiryList" element={<Admin_InquiryList />} />
                    <Route path="/admin_FAQManager" element={<Admin_FAQManager />} />
                    <Route path="/admin_NoticeManager" element={<Admin_NoticeManager />} />
                    <Route path="/admin_MemberManager" element={<Admin_MemberManager />} />
                    <Route path="/admin_ProductManager" element={<Admin_ProductManager />} />
                    <Route path="/admin_ReviewManager" element={<Admin_ReviewManager />} />
                    <Route path="/admin_CollectionManager" element={<Admin_CollectionManager />} />
                    <Route path="/admin_EventManager" element={<Admin_EventManager />} />
                    <Route path="/bizOrderBoard" element={<BizOrderBoard />} />
                    <Route path="/biz_OrderWrite" element={<Biz_OrderWrite />} />
                    <Route path="/main_CompanyProfile" element={<Main_CompanyProfile />} />
                    <Route path="/mypage/retouch" element={<MyRetouchList />} />
                    <Route path="/mypage" element={<MemberHome />} />
                    {/* <Route path="/leasePage" element={<LeasePage />} /> */}
                    <Route path="/authorRegisterIntro" element={<AuthorRegisterIntro />} />
                    <Route path="/authorRegisterForm" element={<AuthorRegisterForm />} />
                    <Route path="/authorPage/:id" element={<AuthorPage />} />
                    <Route path="/guestOrderSearch" element={<GuestOrderSearch />} />
                    <Route path="/link-social" element={<LinkSocial />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/policy/terms" element={<Terms />} />
                    <Route path="/policy/privacy" element={<Privacy />} />

                    {/* 어드민 */}
                    <Route path="/admin/insert_Product" element={<Insert_Product/>} />
                    <Route path="/admin/order_Status" element={<Order_Status/>} />   
                    <Route path="/admin/order_Detail/:itemId" element={<Admin_Order_Detail/>} />
                    <Route path="/admin_BizList" element={<Admin_BizList />} />
                    <Route path="/admin/biz/view/:id" element={<Admin_BizView />} />
                    {/* <Route path="/admin/lease_Status" element={<Admin_Lease_Status />} /> */}
                    <Route path="/admin_AuthorManager" element={<Admin_AuthorManager />} />
                    <Route path="/admin_AdminRetouchList" element={<Admin_RetouchList />} />
                    
                </Route>
            </Routes>
            <ToastContainer
                position="top-center"
                autoClose={2500}
                hideProgressBar={true}
                closeOnClick
                draggable={false}
                pauseOnHover
                toastClassName="custom-toast-white"
                bodyClassName="custom-toast-body"
            />
        </MemberProvider>
    );
  }
  

export default App;