
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

function App() {
 
  return (
    <>
      <BrowserRouter basename='/dashboard/'>
      <div className='container'>
        <Navbar/>
        <div className='dashboard'>
          <Routes >
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
          </Routes>
          </div>
      </div>
      </BrowserRouter>
    </>
  )
}

export default App
