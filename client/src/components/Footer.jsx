import React from "react"
import githubIcon from "../assets/github.png";
import emailIcon from "../assets/email.png"

const Footer = () => {
    return (
        <footer style={{
            marginTop: "auto",
            padding: "30px 20px 20px",
            textAlign: "center",
            color: "#7f8c8d",
            fontSize: "0.9rem",
            borderTop: "1px solid #eaeaea"
        }}>
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                gap: "25px", 
                marginBottom: "15px",
                flexWrap: "wrap"
            }}>
                <a 
                    href="https://github.com/Fraalloo/CadavreExquis" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{color: "#3498db", textDecoration: "none", fontWeight: "bold"}}
                >
                    <img src={githubIcon} alt="GitHub" style={{width: "20px", height: "20px"}}/>
                </a>
                
                <a 
                    href="mailto:gallfrancgall@gmail.com?subject=Info%20su%20Cadavre%20Exquis" 
                    style={{color: "#3498db", textDecoration: "none", fontWeight: "bold"}}
                >
                    <img src={emailIcon} alt="Email" style={{width: "20px", height: "20px"}}/>
                </a>
            </div>

            <p style={{margin: "0 0 5px 0"}}>
                © 2026 - {new Date().getFullYear()}<br/>
                Cadavre Exquis - Francesco Emanuel Gallo
            </p>
            <p style={{margin: 0, fontSize: "0.8rem", opacity: 0.7}}>
                Versione {import.meta.env.VITE_APP_VERSION}
            </p>
        </footer>
    )
}

export default Footer