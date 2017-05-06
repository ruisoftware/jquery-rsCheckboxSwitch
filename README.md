# jquery-rsCheckboxSwitch [![Build Status](https://travis-ci.org/ruisoftware/jquery-rsCheckboxSwitch.svg?branch=master)](https://travis-ci.org/ruisoftware/jquery-rsCheckboxSwitch)
A CSS only plug-in that animates an on/off control with multiple frames for a realistic look.

It displays three types of buttons:
- Toggle button  
![image](https://cloud.githubusercontent.com/assets/428736/25072479/f539c94c-22d7-11e7-8fdf-1b60e2720cff.png)
- Push button  
![image](https://cloud.githubusercontent.com/assets/428736/25072483/08b13c3a-22d8-11e7-9991-38a53637196a.png)
- Sliding button  
![image](https://cloud.githubusercontent.com/assets/428736/25072476/d93c9468-22d7-11e7-9a72-1b2bc3d458e0.png)

# Key Features
 - Highly configurable;
 - Works with any HTML element;
 - Desktop and mobile devices;
 - CSS only based design (no images) that supports responsive design;
 - Optionally uses the keyboard (space, Enter or Esc);
 - Small footprint.

Here is an example:
```html
    <input type="checkbox">
```
```javascript
    $("input[type='checkbox']").rsCheckboxSwitch();
```
The following table shows each individual frame used during the transition from OFF to ON.  

| Type | Frames |
|---|---|
|Toggle|![image](https://cloud.githubusercontent.com/assets/428736/25073090/59f46b9e-22e7-11e7-8c11-d4e1117accbc.png)|
|Push|![image](https://cloud.githubusercontent.com/assets/428736/25073087/4f3dd10e-22e7-11e7-8787-08a1d5850630.png)|
|Sliding|Individual frames do not apply for sliding buttons|

As you can see, by default, toggle buttons have 5 frames and Push button have 4 frames.

[Live demo here](https://rawgit.com/ruisoftware/jquery-rsCheckboxSwitch/master/src/demo/demo.html).

# Faq
### Is it possible to change the colors and style?
Sure it is possible to change.
For reasons related with performance and responsive design, each frame is made out of pure CSS with relative `em` units. These are not images at all. These relative units should always be used, even if you wish to use a fixed size layout.  
For your convenience, there is a LESS file at `src/rsCheckboxSwitch.less` where you can change the frames to your preference. If you are interested in changing only the color palette, you can change the `@background` variable in the LESS file.  
However, nothing stops you from using images for each frame, although that might cause performance and responsive design issues later on.

### Is it possible to change the number of frames?
Yes, you can use as many frames you wish. If you only use 1 or 2 frames, then there is no point using this plug-in, since that can be easly done with CSS alone.  
You need to make sure the frames you specify in `frameClasses` property are defined in the LESS file.

### How can I compile LESS into CSS?
Run
```bash
grunt less
```
It creates a new `dist/rsCheckboxSwitch.css` file.

### Cannot this be done with CSS alone?
It depends...  
Yes, if you want to simply smooth (interpolate) frames between a start and an end frame. In this case, you should not use this plug-in and must resort to CSS transitions.  
No, if you want to design specific frames that are distinct from each other and thus not possible to replicate via CSS transitions.

### Why cannot use CSS animations to specify distinct frames?
The same question has been asked for the jquery.rsButton plug-in.  
You can check the [answer given there](https://github.com/ruisoftware/jquery-rsButton#why-cannot-use-css-animations-to-specify-distinct-frames).

# Installation

You can install from [npm](https://www.npmjs.com/):
```bash
npm install jquery.rscheckboxswitch --save
```
or directly from git:
```javascript
<script src="http://rawgit.com/ruisoftware/jquery-rsCheckboxSwitch/master/src/jquery.rsCheckboxSwitch.js"></script>
```
or you can download the Zip archive from github, clone or fork this repository and include `jquery.rsCheckboxSwitch.js` from your local machine.

You also need to download jQuery. In the example below, jQuery is downloaded from Google cdn.

#Usage
```javascript
<!doctype html>
<html>
<head>
    <title>jquery-rsCheckboxSwitch plug-in</title>
    <link rel="stylesheet" href="http://rawgit.com/ruisoftware/jquery-rsCheckboxSwitch/master/src/demo/rsCheckboxSwitch24px.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="http://rawgit.com/ruisoftware/jquery-rsCheckboxSwitch/master/src/jquery.rsCheckboxSwitch.js"></script>
    <script>
        $(document).ready(function () {
            $('input[type="checkbox"]').rsCheckboxSwitch();
        });
    </script>
</head>
<body>
    <input type="checkbox">
<body>
</html>
````
[Live demo here](https://codepen.io/ruisoftware/pen/mmqrKy).

# License
This project is licensed under the terms of the [MIT license](https://opensource.org/licenses/mit-license.php)

# Bug Reports & Feature Requests
Please use the [issue tracker](https://github.com/ruisoftware/jquery-rsCheckboxSwitch/issues) to report any bugs or file feature requests.

# Contributing
Please refer to the [Contribution page](https://github.com/ruisoftware/jquery-rsCheckboxSwitch/blob/master/CONTRIBUTING.md) from more information.
