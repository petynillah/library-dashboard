import { Link } from 'react-router-dom'
import logo from '../assets/logo.jpg'
import { DASHBOARD_URLS } from '../Appurl';

function Navbar(){

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        window.location.href = `${DASHBOARD_URLS.login}/login/stafflogin`;
    };

    return(
        <>
        <div className='navbar'>
        <img src={logo} alt='logo'></img>
            <div className='list'>
                <ul>
                    <li><a href={`${DASHBOARD_URLS.login}/login/staffdash`}>home</a></li>
                    <li><Link to="/bookdash">Books</Link></li>
                    <li><Link to="/addcategory"> Category</Link></li>
                    <li><Link to="/addshelf">Shelving</Link></li>
                    <li><Link to="/studentdash">Students</Link></li>
                    <li><Link to="/borrowbook">Borrow</Link></li>
                </ul>
            </div>
            <div className='set'>
                <a href={`${DASHBOARD_URLS.login}/login/settings`}>Settings</a>
                <button onClick={handleLogout} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' }}>
                    Logout
                </button>
            </div>
        </div>
        </>
    )   
}
export default Navbar