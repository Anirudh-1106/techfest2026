import gaming from "../assets/gaming.webp";
import gamingSmall from "../assets/gaming-400.webp";
import hackathon from "../assets/hackathon.webp";
import hackathonSmall from "../assets/hackathon-400.webp";
import robotics from "../assets/robotics.webp";
import roboticsSmall from "../assets/robotics-400.webp";
import workshop from "../assets/workshop.webp";
import workshopSmall from "../assets/workshop-400.webp";

function Gallery() {

    return (

        <main className="gallery-page">

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
                            srcSet={`${hackathonSmall} 400w, ${hackathon} 800w`}
                            sizes="(max-width: 600px) 100vw, 400px"
                            alt="Hackathon event"
                            width="800"
                            height="436"
                            fetchPriority="high"
                            decoding="async"
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
                            srcSet={`${roboticsSmall} 400w, ${robotics} 800w`}
                            sizes="(max-width: 600px) 100vw, 400px"
                            alt="Robotics event"
                            width="800"
                            height="436"
                            loading="lazy"
                            decoding="async"
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
                            srcSet={`${gamingSmall} 400w, ${gaming} 800w`}
                            sizes="(max-width: 600px) 100vw, 400px"
                            alt="Gaming event"
                            width="800"
                            height="436"
                            loading="lazy"
                            decoding="async"
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
                            srcSet={`${workshopSmall} 400w, ${workshop} 800w`}
                            sizes="(max-width: 600px) 100vw, 400px"
                            alt="Workshop event"
                            width="800"
                            height="436"
                            loading="lazy"
                            decoding="async"
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