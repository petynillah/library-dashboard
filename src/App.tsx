import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './component/Navbar'
import Bookd from './pages/Bookd'
import Updateb from './pages/Updateb'
import Availableb from './pages/Availableb'
import Addb from './pages/Addb'
import Categoryadd from './pages/Categoryadd'
import Updatecat from './pages/Updatecat'
import Allcat from './pages/Allcat'
import Borrowb from './pages/Borrowb'
import Returnborr from './pages/Returnborr'
import Borrowedb from './pages/Borrowedb'
import Addshelf from './pages/Addshelf'
import Student from './pages/Student'
import Allstudents from './pages/Allstudents'
import Addstudent from './pages/Addstudent'
import Updatestudent from './pages/Updatestudent'
import Shelveavail from './pages/Shelveavail'
import Updateshelf from './pages/Updateshelf'
import SSOGuard from './SSOGuard'

function App() {
  return (
    <>
      <BrowserRouter basename='/dashboard/'>
      <div className='container'>
        <Navbar/>
        <div className='dashboard'>
          <Routes >
            
            {/* ========================================================= */}
            {/* 🔑 OPENING THE SECURITY GUARD LAYOUT BLOCK                 */}
            {/* ========================================================= */}
            <Route element={<SSOGuard />}>
              
              {/* === CATEGORY 1: STANDARD ROOT PATHS === */}
              <Route path='/bookdash' element={<Bookd/>}/>
              <Route path='/updatebook' element={<Updateb/>}/>
              <Route path='/availablebk' element={<Availableb/>}/>
              <Route path='/addbook' element={<Addb/>}/>
              <Route path='/addcategory' element={<Categoryadd/>}/>
              <Route path='/updatecat/:category_id' element={<Updatecat/>}/>
              <Route path='/allcat' element={<Allcat/>}/>
              <Route path='/borrowbook' element={<Borrowb/>}/>
              <Route path='/returnborrow' element={<Returnborr/>}/>
              <Route path='/borrowedbook' element={<Borrowedb/>}/>
              <Route path='/shelfavailable' element={<Shelveavail/>}/>
              <Route path='/addshelf' element={<Addshelf/>}/>
              <Route path='/updateshelf/:shelf_number' element={<Updateshelf/>}/>
              <Route path='/studentdash' element={<Student/>}/>
              <Route path='/allstudents' element={<Allstudents/>}/>
              <Route path='/addstudent' element={<Addstudent/>}/>
              <Route path='/updatestudent/:id' element={<Updatestudent/>}/>

              {/* === CATEGORY 2: DASHBOARD SUB-FOLDER FALLBACKS === */}
              <Route path='/dashboard/bookdash' element={<Bookd/>}/>
              <Route path='/dashboard/updatebook' element={<Updateb/>}/>
              <Route path='/dashboard/availablebk' element={<Availableb/>}/>
              <Route path='/dashboard/addbook' element={<Addb/>}/>
              <Route path='/dashboard/addcategory' element={<Categoryadd/>}/>
              <Route path='/dashboard/updatecat/:category_id' element={<Updatecat/>}/>
              <Route path='/dashboard/allcat' element={<Allcat/>}/>
              <Route path='/dashboard/borrowbook' element={<Borrowb/>}/>
              <Route path='/dashboard/returnborrow' element={<Returnborr/>}/>
              <Route path='/dashboard/borrowedbook' element={<Borrowedb/>}/>
              <Route path='/dashboard/shelfavailable' element={<Shelveavail/>}/>
              <Route path='/dashboard/addshelf' element={<Addshelf/>}/>
              <Route path='/dashboard/updateshelf/:shelf_number' element={<Updateshelf/>}/>
              <Route path='/dashboard/studentdash' element={<Student/>}/>
              <Route path='/dashboard/allstudents' element={<Allstudents/>}/>
              <Route path='/dashboard/addstudent' element={<Addstudent/>}/>
              <Route path='/dashboard/updatestudent/:id' element={<Updatestudent/>}/>

            </Route>
            {/* ========================================================= */}
            {/* 🔒 CLOSING THE SECURITY GUARD LAYOUT BLOCK                 */}
            {/* ========================================================= */}
            
            {/* Global Diagnostic Catch-All (Sits outside so it can catch missing paths) */}
            <Route path="*" element={<div style={{ padding: '30px', color: 'red' }}>⚠️ Error: Target Sub-Route Location Missing.</div>} />
          </Routes>
          </div>
      </div>
      </BrowserRouter>
    </>
  )
}

export default App
