import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemberContext } from '../../../context/MemberContext'
import { toast } from 'react-toastify';
import axios from 'axios';

const Modify = () => {
    const API = process.env.REACT_APP_API_BASE;
    const navigate = useNavigate();
    const nowPasswordRef = useRef(null);
    const newPasswordRef = useRef(null);
    const emailRef = useRef(null);
    const { member, setMember } = useContext(MemberContext); 

    const [id, setId] = useState('');
    const [nowPassword, setNowPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phone1, setPhone1] = useState('010');
    const [phone2, setPhone2] = useState('');
    const [phone3, setPhone3] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [region, setRegion] = useState('');
    const [smsAgree, setSmsAgree] = useState(false);
    const [emailAgree, setEmailAgree] = useState(false);

    // 최초 로드 시 로그인된 사용자 정보로 초기값 설정
    useEffect(() => {
        if (member) {
            setId(member.id || '');
            setName(member.name || member.nickname || '');
            setEmail(member.email || '');
            setGender(member.gender || '');
            setRegion(member.region || '');
            setSmsAgree(member.smsAgree);
            setEmailAgree(member.emailAgree);

            if (member.phone) {
                const [p1 = '010', p2 = '', p3 = ''] = member.phone.split('-');
                setPhone1(p1); setPhone2(p2); setPhone3(p3);
            }

            if (member.birth) {
                const [y = '', m = '', d = ''] = member.birth.split('-');
                setBirthYear(y); setBirthMonth(m); setBirthDay(d);
            } 
        }
    }, [member]);
    
    // 비밀번호 형식 체크
    const isValidPassword = (password) => {
        if (password.length < 8 || password.length > 16) return false;

        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const count = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
        return count >= 2;
    };

    const birthStr = (birthYear && birthMonth && birthDay) 
        ? `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}` : null;

    const handleModifySubmit = async (e) => {
        e.preventDefault();

        const isValidBirth = () => {
            if (!birthYear && !birthMonth && !birthDay) return true; // 아예 안 쓴 경우 허용
        
            if (!(birthYear && birthMonth && birthDay)) {
                toast.error("생년월일을 모두 입력해주세요.");
                return false;
            }
        
            if (birthYear.length !== 4 || birthMonth.length !== 2 || birthDay.length !== 2) {
                toast.error("생년월일 형식을 맞춰주세요. (예: 2000-01-01)");
                return false;
            }
        
            const y = parseInt(birthYear, 10);
            const m = parseInt(birthMonth, 10);
            const d = parseInt(birthDay, 10);
        
            if (isNaN(y) || isNaN(m) || isNaN(d)) {
                toast.error("생년월일은 숫자만 입력해주세요.");
                return false;
            }
        
            if (m < 1 || m > 12) {
                toast.error("월은 01~12 사이여야 합니다.");
                return false;
            }
        
            if (d < 1 || d > 31) {
                toast.error("일은 01~31 사이여야 합니다.");
                return false;
            }
        
            return true;
        };
        
        if (!member?.name || !phone2.trim() || !phone3.trim() || !member.smsAgree || !member.email || !member.emailAgree) {
            toast.error('필수 정보들을 입력해 주세요.');
            return;
        }

        if (member && member.provider === 'web') {
            // 1. 현재 비밀번호 확인 요청
            if (!nowPassword) {
                toast.error('현재 비밀번호를 입력해주세요.');
                nowPasswordRef.current?.focus();
                return;
            }

            try{
                const res = await axios.post(`${API}/member/check-password`, {
                    id,
                    password : nowPassword
                }, { withCredentials: true});

                
                // 2. 비밀번호 현식 및 중복 체크
                if (newPassword) {
                    if (!isValidPassword(newPassword)) {
                        toast.error('비밀번호는 영문 대소문자, 숫자, 특수문자 중 2가지 이상 조합이며 8~16자여야 합니다.');
                        newPasswordRef.current?.focus();
                        return;
                    } else if (newPassword !== confirmPassword) {
                        toast.error("새 비밀번호가 일치하지 않습니다.");
                        newPasswordRef.current?.focus();
                        return;
                    } else if (nowPassword === newPassword) {
                        toast.error("새 비밀번호가 현재 비밀번호와 같습니다.");
                        newPasswordRef.current?.focus();
                        return
                    }
                }

                // 이메일 체크
                const isValidEmail = (email) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(email);
                };

                if (!isValidEmail(email)) {
                    toast.error('올바른 이메일 형식을 입력해주세요.');
                    emailRef.current?.focus();
                    return false;
                }

                if (!isValidBirth()) return;

                //3. formData 구성
                const formData = {
                    id,
                    name,
                    email,
                    phone: `${phone1}-${phone2}-${phone3}`,
                    gender: gender || null,
                    birth: birthStr,
                    region,
                    smsAgree,
                    emailAgree,
                    currentPassword: nowPassword,
                    newPassword: newPassword || null
                };
                console.log("birth : ", birthStr);

                // 수정 요청
                await axios.post(`${API}/member/update`, formData, { withCredentials: true});

                // 최신 사용자 정보 fetch
                const response = await axios.get(`${API}/member/me`, {
                    withCredentials: true,
                });
                setMember(response.data);

                toast.success("회원정보가 수정되었습니다.");
                setNowPassword('');
                setNewPassword('');
                setConfirmPassword('');
            
            } catch (err) {
                if (err.response?.status === 401) {
                    toast.error('현재 비밀번호가 일치하지 않습니다.');
                } else {
                    toast.error('회원정보 수정에 실패했습니다.');
                }
            }
        } else {
            // 소셜 로그인 사용자 : 비밀번호 없이 업데이트

            if (!isValidBirth()) return;

            const formData = {
                id,
                name,
                email,
                phone: `${phone1}-${phone2}-${phone3}`,
                gender,
                birth: `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`,
                region,
                smsAgree: smsAgree,
                emailAgree: emailAgree,
                provider: member.provider
            };

            try {
                await axios.post(`${API}/member/update`, formData, { withCredentials: true });

                // 최신 사용자 정보 fetch
                const response = await axios.get(`${API}/member/me`, {
                    withCredentials: true,
                });
                setMember(response.data);

                toast.error('회원정보가 수정되었습니다.');
                navigate('/modify');
            } catch (err) {
                console.error(err);
                toast.error('회원정보 수정에 실패했습니다.');
            }
        }
    };

    // 회원탈퇴
    const handleDeleteAccount = async () => {
        if (!member) return;

        if (!window.confirm('정말로 회원 탈퇴하시겠습니까? 탈퇴 후 복구할 수 없습니다.')) {
            return;
        }

        try {
            await axios.post(`${API}/member/delete`, { id }, { withCredentials: true});

            toast.error('회원 탈퇴가 완료되었습니다.');
            setMember(null);
            navigate('/');
        } catch (err) {
            console.error(err);
            toast.error('회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
        }
    }
    
    if (!member) {
        return <div> 로딩 중...</div>;
    }

    return (
        <div className="flex w-full">
            <form className="flex flex-col w-full">
                <div className="flex flex-col">
                    <span 
                        className="
                            md:text-xl text-[clamp(14px,2.607vw,20px)] 
                            font-bold pb-6">| 회원 정보 수정</span>                    
                </div>
                <div className="w-full mx-auto mb-10">
                    <hr/>
                    <div className="
                        flex md:flex-row flex-col
                        md:items-center items-start
                        mt-3 mx-2 mb-3">
                        <div 
                            className="
                                md:text-base text-[clamp(11px,2.08vw,16px)]
                                min-w-[150px]">
                            아이디 <span className="font-bold text-red-500">*</span>
                        </div>
                        <div className="flex-cols lg:w-auto w-full">
                            <input type="text" id="readonly-value" value={id} disabled 
                                className="
                                    md:text-base text-[clamp(11px,2.08vw,16px)]
                                    md:w-[200px] w-full
                                    flex border-[1px] h-8 pl-2" />
                            <span 
                                className="
                                    flex
                                    md:text-xs text-[clamp(8px,1.5645vw,12px)]
                                    ">(영문소문자/숫자, 4~16자)</span>
                        </div>
                    </div>

                    <hr/>

                    {member && member.provider === 'web' && (
                        <div>
                            <div 
                                className="
                                    flex md:flex-row flex-col
                                    md:items-center items-start
                                    mt-3 mx-2 mb-3">
                                <div 
                                    className="
                                        md:text-base text-[clamp(11px,2.08vw,16px)]
                                        min-w-[150px]">
                                    현재 비밀번호 <span className="font-bold text-red-500">*</span>
                                </div>
                                <input type="password" value={nowPassword} onChange={(e) => setNowPassword(e.target.value)} ref={nowPasswordRef} 
                                    className="
                                        md:text-base text-[clamp(11px,2.08vw,16px)]
                                        md:w-[200px] w-full
                                        flex border-[1px] h-8 pl-2" />
                            </div>

                            <hr/>

                            <div 
                                className="
                                    flex md:flex-row flex-col
                                    md:items-center items-start
                                    mt-3 mx-2 mb-3">
                                <div 
                                    className="
                                        md:text-base text-[clamp(11px,2.08vw,16px)]
                                        min-w-[150px]">
                                    새 비밀번호
                                </div>
                                <div className="flex sm:flex-row flex-col w-full sm:items-center">
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} ref={newPasswordRef} 
                                        className="
                                            md:text-base text-[clamp(11px,2.08vw,16px)]
                                            md:w-[200px] w-full
                                            flex border-[1px] h-8 pl-2
                                        " />
                                    {newPassword && !isValidPassword(newPassword) && (
                                        <div 
                                            className="
                                                md:text-xs text-[clamp(7px,1.5645vw,12px)] 
                                                sm:w-auto w-[125px] sm:ml-1">
                                            (영문/숫자/특수문자 중 2종 이상, 8~16자)
                                        </div>
                                    )}
                                </div>
                            </div>

                            <hr/>

                            <div className="
                                flex md:flex-row flex-col
                                md:items-center items-start
                                mt-3 mx-2 mb-3">
                                <div 
                                    className="
                                        md:text-base text-[clamp(11px,2.085vw,16px)]
                                        min-w-[150px]">
                                    새 비밀번호 확인
                                </div>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                                    className="
                                        md:text-base text-[clamp(11px,2.085vw,16px)]
                                        md:w-[200px] w-full
                                        flex border-[1px] h-8 pl-2" />
                            </div>
                            <hr/>
                        </div>
                    
                    )}

                    <div 
                        className="
                            flex md:flex-row flex-col
                            md:items-center items-start 
                            mt-3 mx-2 mb-3">
                        <div 
                            className="
                                md:text-base text-[clamp(11px,2.085vw,16px)]
                                min-w-[150px]">
                            이름 <span className="font-bold text-red-500">*</span>
                        </div>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} 
                            className="
                                md:text-base text-[clamp(11px,2.085vw,16px)]
                                md:w-[200px] w-full
                                flex border-[1px] h-8 pl-2" />
                    </div>

                    <hr/>

                    <div 
                        className="
                            md:text-base text-[clamp(11px,2.085vw,16px)]
                            flex md:flex-row flex-col
                            md:items-center items-start
                            mt-3 mx-2 mb-3">
                        <div 
                            className="
                                min-w-[150px]">
                            휴대전화 <span className="font-bold text-red-500">*</span>
                        </div>
                        <div className="flex gap-2 w-full">
                            <select value={phone1} onChange={(e) => setPhone1(e.target.value)} 
                                className="
                                    md:w-[70px] w-1/3 text-center
                                    h-8 border border-gray-300 sm:pl-2">
                                <option>010</option>
                                <option>011</option>
                                <option>016</option>
                                <option>017</option>
                                <option>018</option>
                                <option>019</option>
                            </select>
                            <input type="text" maxLength="4" value={phone2} onChange={(e) => setPhone2(e.target.value)} inputMode="numeric" 
                                className="
                                    md:w-[60px] w-1/3
                                    h-8 border border-gray-300 text-center"/>
                            <input type="text" maxLength="4" value={phone3} onChange={(e) => setPhone3(e.target.value)} inputMode="numeric" 
                                className="
                                    md:w-[60px] w-1/3
                                    h-8 border border-gray-300 text-center"/>
                        </div>
                    </div>
                
                    <hr/>

                    <div 
                        className="
                            md:text-base text-[clamp(11px,2.085vw,16px)]
                            flex md:flex-row flex-col
                            md:items-center items-start 
                            mt-3 ml-2 mb-3">
                        <div 
                            className="sm:w-[150px] w-[95px]">
                            SMS 수신여부 <span className="font-bold text-red-500">*</span>
                        </div>

                        <div className="flex flex-row">
                            <div className="flex items-center">
                                <input type="radio" id="sms-receive-yes" name="smsReceive" checked={smsAgree === true} onChange={() => setSmsAgree(true)} className="border-[1px] sm:h-7 h-4" />
                                <label htmlFor="sms-receive-yes">수신함</label>
                            </div>

                            <div className="flex items-center ml-2">
                                <input type="radio" id="sms-receive-no" name="smsReceive" checked={smsAgree === false} onChange={() => setSmsAgree(false)} className="border-[1px] sm:h-7 h-4" />
                                <label htmlFor="sms-receive-no">수신안함</label>
                            </div>
                        </div>
                    </div>

                    <hr/>

                    <div 
                        className="
                            md:text-base text-[clamp(11px,2.085vw,16px)]
                            flex md:flex-row flex-col
                            md:items-center items-start
                            mt-3 mx-2 mb-3">
                        <div 
                            className="
                                sm:w-[150px] w-[95px]">
                            이메일 <span className="font-bold text-red-500">*</span>
                        </div>
                        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} disabled={member && member.provider !== 'web'} ref={emailRef} 
                            className="
                                sm:w-[200px] w-full
                                border-[1px] h-8 pl-2" />
                    </div>
                    
                    <hr/>

                    <div 
                        className="
                            md:text-base text-[clamp(11px,2.085vw,16px)]
                            flex md:flex-row flex-col
                            md:items-center items-start 
                            mt-3 mx-2 mb-3">
                        <div className="sm:w-[150px] w-[95px]">
                            이메일 수신여부 <span className="font-bold text-red-500">*</span>
                        </div>

                        <div className="flex flex-row">
                            <div className="flex items-center">
                                <input type="radio" id="email-receive-yes" name="emailReceive" checked={emailAgree === true} onChange={() => setEmailAgree(true)} className="border-[1px] mr-1 sm:h-7 h-4" />
                                <label htmlFor="email-receive-yes">수신함</label>
                            </div>

                            <div className="flex items-center ml-2">
                                <input type="radio" id="email-receive-no" name="emailReceive" checked={emailAgree === false} onChange={() => setEmailAgree(false)} className="border-[1px] mr-1 sm:h-7 h-4" />
                                <label htmlFor="email-receive-no">수신안함</label>
                            </div>
                        </div>
                    </div>
                    
                    <hr/>
        
                    <div className="
                        md:text-xl text-[clamp(14px,2.607vw,20px)]
                        mt-10 ml-3 mb-3 font-bold">
                        <span> 추가정보 </span>
                    </div>

                    <hr/>

                    <div 
                        className="
                            md:text-base text-[clamp(11px,2.085vw,16px)]
                            flex md:flex-row flex-col
                            md:items-center items-start
                            mt-3 mx-2 mb-3">
                        <div className="sm:w-[150px] w-[95px]">
                            성별
                        </div>

                        <div className="flex flex-row">
                            <div className="flex items-center">
                                <input type="radio" id="gender-man" name="genderSelect" checked={gender === 'M'} onChange={() => setGender('M')} className="border-[1px] mr-1 sm:h-7 h-4" />
                                <label htmlFor="gender-man">남자</label>
                            </div>

                            <div className="flex items-center ml-2">
                                <input type="radio" id="gender-woman" name="genderSelect" checked={gender === 'F'} onChange={() => setGender('F')} className="border-[1px] mr-1 sm:h-7 h-4" />
                                <label htmlFor="gender-woman">여자</label>
                            </div>
                        </div>
                    </div>

                    <hr/>

                    <div 
                        className="
                            md:text-base text-[clamp(11px,2.085vw,16px)]
                            flex md:flex-row flex-col
                            md:items-center items-start 
                            mt-3 mx-2 mb-3">
                        <div 
                            className="
                                sm:w-[150px] w-[95px]">
                            생년월일
                        </div>
                        <div>
                            <input type="text" maxLength="4" inputMode="numeric" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} 
                                className="
                                    sm:w-[60px] w-1/3 h-8 border border-gray-300 text-center"/>
                            <span className=" mx-[2px]">년</span>
                            <input type="text" maxLength="2" inputMode="numeric" value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} 
                                className="
                                    sm:w-[50px] w-1/5 h-8 border border-gray-300 text-center"/>
                            <span className="sm:text-base text-[11px] mx-[2px]">월</span>
                            <input type="text" maxLength="2" inputMode="numeric" value={birthDay} onChange={(e) => setBirthDay(e.target.value)} 
                                className="
                                    sm:w-[50px] w-1/5 h-8 border border-gray-300 text-center"/>
                            <span className="mx-[2px]">일</span>
                        </div>
                    </div>

                    <hr/>

                    <div 
                        className="
                            md:text-base text-[clamp(11px,2.085vw,16px)]
                            flex md:flex-row flex-col
                            md:items-center items-start
                            mt-3 mx-2 mb-3">
                        <div className="sm:w-[150px] w-[95px]">
                            지역 
                        </div>
                        <select value={region} onChange={(e) => setRegion(e.target.value)} 
                            className="
                                md:w-[100px] w-1/2 h-8 text-center border-black border-[1px] border-opacity-15">
                            {['선택', '강원', '경기', '경남', '경북', '광주', '대구', '대전', '부산', '서울', '세종', '울산', '인천', '전남', '전북', '제주', '충남', '충북', '해외'].map((region) => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>

                    <hr/>

                    <div 
                        className="
                            md:text-base text-[clamp(11px,2.085vw,16px)]
                            mt-3 mb-3">
                        <button type="button" 
                            className="
                                text-red-600 border-[1px] border-red-400 flex ml-3 px-2 py-1" onClick={handleDeleteAccount}> 회원탈퇴 </button>
                    </div>

                    <div 
                        className="
                            md:text-base text-[clamp(11px,2.085vw,16px)]
                            flex items-center justify-center">
                        <div className="flex gap-2 mx-auto">
                            <button 
                                className="
                                    md:px-8 px-[clamp(16px,4.999vw,32px)] 
                                    md:py-3 py-[clamp(8px,1.874vw,12px)]
                                    flex rounded-[4px] border-[1px] border-black"> 취소 </button>
                            <button type="submit" 
                                className="
                                    md:px-8 px-[clamp(16px,4.999vw,32px)] 
                                    md:py-3 py-[clamp(8px,1.874vw,12px)]
                                    flex text-white bg-black 
                                    rounded-[4px] border-[1px] border-black"
                                    onClick={handleModifySubmit}
                            > 회원정보수정 </button>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    )
}

export default Modify;