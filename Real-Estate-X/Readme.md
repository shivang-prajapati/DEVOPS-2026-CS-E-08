<div align="center">

# EstateX 🏡 Real Estate Agency Website 🌍

<br/>

<div align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white&style=for-the-badge" height="40" alt="HTML5 logo" style="margin-right:12px;" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white&style=for-the-badge" height="40" alt="CSS3 logo" style="margin-right:12px;" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black&style=for-the-badge" height="40" alt="JavaScript logo" />
</div>

</div>

---

### 🧠 What is it

**EstateX** is a digital platform for showcasing residential and commercial properties for sale or rent.  
It focuses on an intuitive interface, elegant visuals, and interactive features for a seamless browsing experience.

---

### 💡 Why it is

Real estate websites require **mobile-friendly, visually appealing layouts** that provide easy navigation and fast access to property details.  
**EstateX** delivers a clean, modern experience optimized for Pakistani users and overseas clients.

---

### ⚙️ What is the Problem

Many real estate websites

- Lack mobile-first design  
- Do not provide dynamic property listings  
- Have complex, hard-to-navigate interfaces

---

### 🧩 What is the Solution

**EstateX** solves these problems with

- 🏠 **Responsive Design** optimized for mobile, tablet, and desktop  
- 🔍 **Property Search & Filters** by location, price, and type  
- 🖼️ **Image Carousels** for property galleries  
- 📍 **Google Maps Integration** for precise property locations  
- 📬 **Contact Form** for inquiries directly via email  
- 🌙 **Dark Mode Toggle** for user preference  
- 🗂️ **Modular Code Structure** for clean, reusable HTML, CSS, and JS

---

### 🚀 Result

A polished, responsive real estate website that

- Provides an intuitive, mobile-first browsing experience  
- Displays properties dynamically with filtering options  
- Offers smooth navigation, galleries, and contact functionality  
- Can be extended with backend integration or admin dashboards

---

### 🛠️ Technology Used

HTML5 • CSS3 • JavaScript

### Jenkins Automatic Testing

The repository includes a Jenkins pipeline that validates the project structure,
HTML, website sections, assets, property listings, and services after every
push. To enable automatic builds:

1. Create a Pipeline job in Jenkins using **Pipeline script from SCM**.
2. Select **Git**, enter this repository URL, and set the script path to `Jenkinsfile`.
3. Enable **GitHub hook trigger for GITScm polling** in the job configuration.
4. Add a GitHub webhook for `https://<your-jenkins-host>/github-webhook/`, using
  `application/json` and the **push** event.

The Jenkins host must be reachable by GitHub. The checks run against the
`Real-Estate-X` project directory.

---

<div align="center">

Designed and Developed with 🧠 by Muhammad Tanveer Abbas 🌟

</div>

