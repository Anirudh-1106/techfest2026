import gaming from "../assets/gaming.png";
import hackathon from "../assets/hackathon.png";
import robotics from "../assets/robotics.png";
import workshop from "../assets/workshop.png";

function Gallery() {

    return (

        <main>

            <h1>TechFest Gallery</h1>

            <p>
                Explore highlights and memorable moments from
                TechFest 2026.
            </p>


            <section>

                <h2>Event Highlights</h2>

                <div className="gallery">

                    <div>

                        <img
                            src={hackathon}
                            alt="Hackathon event"
                        />

                        <h3>Hackathon</h3>

                        <p>
                            Students working together to solve
                            innovative challenges.
                        </p>

                    </div>


                    <div>

                        <img
                            src={robotics}
                            alt="Robotics event"
                        />

                        <h3>Robotics</h3>

                        <p>
                            Exciting robotics demonstrations and
                            competitions.
                        </p>

                    </div>


                    <div>

                        <img
                            src={gaming}
                            alt="Gaming event"
                        />

                        <h3>Gaming</h3>

                        <p>
                            Competitive gaming events and student
                            participation.
                        </p>

                    </div>


                    <div>

                        <img
                            src={workshop}
                            alt="Workshop event"
                        />

                        <h3>Workshops</h3>

                        <p>
                            Interactive sessions for learning new
                            technologies and skills.
                        </p>

                    </div>

                </div>

            </section>

        </main>

    );

}

export default Gallery;