import React, { useState, useEffect } from 'react';
import Modal from "react-modal";
import styles from './RegistrationPage.module.css';
import { useLocation } from 'react-router-dom';
import {fetchData} from "../apiService";
import ReactStars from "react-rating-stars-component";

const RegistrationPage = () => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const location = useLocation();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [uwId, setUwId] = useState('');
    const [studentInfo, setStudentInfo] = useState(null);
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [checkedCourses, setCheckedCourses] = useState([]);

    const handleCheckboxChange = (course) => {
        setCheckedCourses((prevCheckedCourses) => {
            if (prevCheckedCourses.includes(course)) {
                return prevCheckedCourses.filter((c) => c !== course);
            } else {
                return [...prevCheckedCourses, course];
            }
        });
    };

    const handleCloseModal = () => {
        console.log("These are the courses that were added: " + courses);
        if (courses == '') {
            window.alert("No classes were added!");
        }
        setSelectedCourses((prevSelectedCourses) => {
            const newCourses = checkedCourses.filter(
                (course) => !prevSelectedCourses.find((c) => c.sln === course.sln)
            );
            return [...prevSelectedCourses, ...newCourses];
        });
        setCheckedCourses([]);
        setModalIsOpen(false);
    };



    useEffect(() => {
        if (location.state && location.state.uwid) {
            const uwId = location.state.uwid;
            setUwId(uwId);
            getStudentInfo(uwId);
        }
    }, [location, location.state]);

    const getStudentInfo = async (uwId) => {
        const getStudentEndpoint = "/getStudent";
        const getStudentOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({'net_id': uwId})
        }
        try {
            const data = await fetchData(getStudentEndpoint, getStudentOptions);
            console.log("data fetched: ", data);
            setStudentInfo(data);
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    const searchCourse = async () => {
        const getClassEndpoint = "/getClass";
        const getClassOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({'class_id': searchTerm})
        };
        try {
            const data = await fetchData(getClassEndpoint, getClassOptions);
            console.log("Class data fetched: ", data);

            if (data.class === undefined) {
                window.alert("No class found!");
                return;
            }
            setCourses([data.class]);
        } catch (error) {
            console.error('Error fetching class data:', error);
        }
    }


    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    const handleRemoveCourse = (courseIndex) => {
        setSelectedCourses(selectedCourses.filter((_, index) => index !== courseIndex));
    };

    return (
        <div className={styles.RegistrationPage}>
            <h1 className={styles.TextStroke}>Registration - Autumn 2023</h1>
            <div className={styles.StudentInfoClass}>

                <select name="quarter" id="quarter">
                    <option value="autumn">Autumn 2023</option>
                    <option value="winter">Winter 2024</option>
                    <option value="spring">Spring 2024</option>
                    <option value="summer">Summer 2024</option>
                </select>
                <button>Change Quarter</button>

                {studentInfo && (
                    <>
                        <p>Prepared for: {studentInfo.Student.student_name}</p>
                        <p>Prepared on: {new Date().toLocaleString('en-US', options)}</p>
                        <p>Major: {studentInfo.Student.major}</p>
                    </>
                )}

                <button onClick={openModal}>َAdd Courses</button>
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Example Modal"
                    className={styles.Modal}
                    overlayClassName={styles.Overlay}
                >
                    <h2 className={styles.AddCourseHeader}>Search and Add Course</h2>
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <button onClick={searchCourse}>Search</button>

                    {courses.length > 0 && (
                    <table className={styles.ModalTable}>
                        <thead>
                            <tr>
                                <th></th>
                                <th>SLN</th>
                                <th>Course</th>
                                <th>Credits</th>
                                <th>Title</th>
                                <th>Professor</th>
                                <th>Class Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            {courses.map((course, index) => (
                                <tr key={index}>
                                    <td><input type="checkbox" onChange={() => handleCheckboxChange(course)} /></td>
                                    <td>{course.sln}</td>
                                    <td>{course.class_id}</td>
                                    <td>{course.credits}</td>
                                    <td>{course.class_name}</td>
                                    <td>{course.professor}</td>
                                    <td>{course.class_times}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}

                    <button onClick={handleCloseModal}>Add Course</button>
                </Modal>
            </div>
            {selectedCourses.length > 0 && (
                <div className={styles.LegendContainer}>
                    <div className={styles.legend}>
                        <div className={styles.legendItem}>
                            <div className={styles.legendColor} style={{backgroundColor: 'green'}}></div>
                            <div>Easy (Average GPA: 3.4 - 4.0)</div>
                        </div>
                        <div className={styles.legendItem}>
                            <div className={styles.legendColor} style={{backgroundColor: 'orange'}}></div>
                            <div>Hard (Average GPA: 2.6 - 3.3)</div>
                        </div>
                        <div className={styles.legendItem}>
                            <div className={styles.legendColor} style={{backgroundColor: 'red'}}></div>
                            <div>Extremely Hard (Average GPA: 0 - 2.5)</div>
                        </div>
                    </div>
                </div>
            )}
            {selectedCourses.length > 0 && (
                <table className={styles.RegistrationTable}>
                    <thead>
                    <tr>
                        <th>SLN</th>
                        <th>Course</th>
                        <th>Credits</th>
                        <th>Title</th>
                        <th>Professor</th>
                        <th>Class Time</th>
                        <th>Average GPA</th>
                        <th>Rating</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {selectedCourses.map((course, index) => {
                        let bgColor;
                        let hoverText;
                        if (course.average_gpa <= 2.5) {
                            bgColor = 'red';
                            hoverText = 'Extremely Hard';
                        } else if (course.average_gpa <= 3.3) {
                            bgColor = 'orange';
                            hoverText = 'Hard';
                        } else {
                            bgColor = 'green';
                            hoverText = 'Easy';
                        }

                        return (
                            <tr key={index} style={{backgroundColor: bgColor}} title={hoverText}>
                                <td>{course.sln}</td>
                                <td>{course.class_id}</td>
                                <td>{course.credits}</td>
                                <td>{course.class_name}</td>
                                <td>{course.professor}</td>
                                <td>{course.class_times}</td>
                                <td>{course.average_gpa}</td>
                                <td>
                                    <ReactStars
                                        count={5}
                                        size={24}
                                        activeColor="#ffd700"
                                        value={course.rating / 2}
                                        edit={false}
                                        isHalf={true}
                                    />
                                </td>
                                <td><button onClick={() => handleRemoveCourse(index)}>Remove Course</button></td>
                            </tr>
                        );
                    })}
                    <tr>
                        <td colSpan={2}>Total Credits</td>
                        <td>{selectedCourses.reduce((total, course) => total + Number(course.credits), 0)}</td>
                    </tr>
                    </tbody>
                </table>
            )}

        </div>
    )

}

export default RegistrationPage;