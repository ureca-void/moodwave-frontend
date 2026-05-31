# MOOD WAVE

음악 스트리밍 개인화 추천 웹 서비스

---

## Introduction

MOOD WAVE는 음악 검색 / 재생뿐 아니라  
AI 감정 분석, 날씨 기반 추천, 음악 취향 분석 기능을 제공하는 웹 서비스입니다.

---

## Team

<table>
  <tr>
    <td align="center" width="180px">
      <a href="https://github.com/haejunbag131-maker">
        <img src="https://github.com/haejunbag131-maker.png" width="120px;" alt="박해준"/>
        <br />
        <sub><b>박해준</b></sub>
      </a>
      <br />
      <b>Frontend</b>
    </td>
    <td align="center" width="180px">
      <a href="https://github.com/donghyeon01">
        <img src="https://github.com/donghyeon01.png" width="120px;" alt="송동현"/>
        <br />
        <sub><b>송동현</b></sub>
      </a>
      <br />
      <b>Frontend</b>
    </td>
    <td align="center" width="180px">
      <a href="https://github.com/Ppakso">
        <img src="https://github.com/Ppakso.png" width="120px;" alt="박소연"/>
        <br />
        <sub><b>박소연</b></sub>
      </a>
      <br />
      <b>Frontend</b>
    </td>
    <td align="center" width="180px">
      <a href="https://github.com/cece-297">
        <img src="https://github.com/cece-297.png" width="120px;" alt="이수아"/>
        <br />
        <sub><b>이수아</b></sub>
      </a>
      <br />
      <b>Frontend</b>
    </td>
  </tr>
</table>

---

## Tech Stack

<table>
  <tr>
    <th width="120px">Frontend</th>
    <td>
      <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
      <img src="https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
      <img src="https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
      <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
    </td>
  </tr>
  <tr>
    <th width="120px">Backend</th>
    <td>
      <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
    </td>
  </tr>
  <tr>
    <th width="120px">Database</th>
    <td>
      <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
    </td>
  </tr>
  <tr>
    <th width="120px">API</th>
    <td>
      <img src="https://img.shields.io/badge/Spotify%20API-1DB954?style=for-the-badge&logo=spotify&logoColor=white"/>
      <img src="https://img.shields.io/badge/OpenAI%20API-412991?style=for-the-badge&logo=openai&logoColor=white"/>
      <img src="https://img.shields.io/badge/OpenWeather%20API-EB6E4B?style=for-the-badge&logo=openweathermap&logoColor=white"/>
    </td>
  </tr>
  <tr>
    <th width="120px">Library</th>
    <td>
      <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white"/>
    </td>
  </tr>
</table>

---

## Architecture

<div align="center">
  <img src="./public/assets/img/MoodWave-Architecture.png" width="900" alt="MOOD WAVE System Architecture"/>
</div>

---

## UI Design

### Layout Structure

MOOD WAVE는 사이드바가 상단까지 확장된 음악 웹앱 레이아웃을 사용합니다.  
레이아웃 구조는 헤더, 사이드바, 메인, 푸터 4가지로 구성됩니다.

<div align="center">
  <img src="./public/assets/img/MoodWave-Layout.png" width="900" alt="MOOD WAVE Layout Structure"/>
</div>

<br />

### Wireframe

전체 와이어프레임은 Spotify 스타일의 음악 스트리밍 웹 서비스를 참고하여 구성했습니다.  
좌측에는 로고와 메뉴를 배치하고, 우측 상단에는 검색창과 프로필 영역을 배치했습니다.  
메인 영역에는 추천 플레이리스트, 인기 음악, 음악 카드, 재생 목록 등이 배치됩니다.  
하단에는 현재 재생 중인 음악과 컨트롤러를 포함한 고정 푸터 플레이어를 구성했습니다.

<div align="center">
  <img src="./public/assets/img/MoodWave-Wireframe.png" width="900" alt="MOOD WAVE Wireframe"/>
</div>
