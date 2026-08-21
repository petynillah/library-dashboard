import { Link } from "react-router-dom"

function Student(){
    return(
        <>
         <h1 className="head1">student dashboard</h1>
        
        <div className="cards">
            <Link to="/addstudent">new student</Link>
            <Link to="/allstudents">delete student</Link>
            <Link to="/allstudents">view all students</Link>
            <Link to="/updatestudent">update student</Link>
        </div>
        </>
    )
}
export default Student