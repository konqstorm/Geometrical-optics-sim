function calculateAngle(event, container) {
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height / 2;

    return Math.PI + Math.atan2(event.clientY - centerY, event.clientX - centerX);
}

function rotateLine(angle, line) {
  line.style.transform = `rotate(${angle}rad)`;
}

function calculateRefractionAngle(alpha, n1, n2) {
    if (n1 * Math.sin(alpha) / n2 >= 1) {
        return Math.PI / 2;
    } else if (n1 * Math.sin(alpha) / n2 <= -1) {
        return -1 * Math.PI / 2;
    } else {
        return Math.asin(n1 * Math.sin(alpha) / n2)
    }
}

function refractAndReflect(angle, sliderTop, sliderBottom, reflectedLine, refractedLine, outputN1, outputN2, enable_polar, polar_angle) {
    const n1 = 1 + sliderTop.value * 9;
    const n2 = 1 + sliderBottom.value * 9;

    // refraction
    let alpha = 0;
    let beta = 0;
    let phi = 0;

    if (angle <= Math.PI) {
        alpha = angle - Math.PI / 2;
        beta = calculateRefractionAngle(alpha, n1, n2);
        phi = Math.PI / 2 + beta;

        // reflection
        reflectedLine.style.transform = `rotate(${-alpha - Math.PI / 2}rad)`;

    } else {
        alpha = angle - 3 * Math.PI / 2;
        beta = beta = calculateRefractionAngle(alpha, n2, n1);
        phi = -1 * Math.PI / 2 + beta;

        // reflection
        reflectedLine.style.transform = `rotate(${-alpha + Math.PI / 2}rad)`;
    }

    refractedLine.style.transform = `rotate(${phi}rad)`;

    // calculating Frenel's coefficients
    const r_s = (n1 * Math.cos(alpha) - n2 * Math.cos(beta)) / (n1 * Math.cos(alpha) + n2 * Math.cos(beta));
    const r_p = (n2 * Math.cos(alpha) - n1 * Math.cos(beta)) /(n2 * Math.cos(alpha) + n1 * Math.cos(beta));

    let s = 0.5;
    let p = 0.5;

    if (enable_polar) {
      let psi = 0;
      if (polar_angle <= Math.PI / 2) {
        psi = Math.PI / 2 - polar_angle;
      } else if (polar_angle.angle <= Math.PI) {
        psi = -1 * Math.PI / 2 + polar_angle;
      } else if (polar_angle.angle <= 3 * Math.PI / 2) {
        psi = 3 * Math.PI / 2 - polar_angle;
      } else {
        psi = -3 * Math.PI / 2 + polar_angle;
      }

      s = Math.sin(psi) ** 2;
      p = Math.cos(psi) ** 2;
    }

    let R = s * (r_s ** 2) + p * (r_p ** 2);

    reflectedLine.style.opacity = R;
    refractedLine.style.opacity = 1 - R;

    // displaing coefficients
    outputN1.textContent = 'n1: ' + n1.toFixed(2);
    outputN2.textContent = 'n2: ' + n2.toFixed(2);

    // displaing anything instead (for testing)
    /*outputN1.textContent = 's: ' + enable_polar;
    outputN2.textContent = 'p: ' + polar_angle;*/
}

function updateOpacity(block, slider) {
  block.style.opacity = slider.value;
}


document.addEventListener('DOMContentLoaded', function() {
  const sliderTop = document.getElementById('sliderTop');
  const sliderBottom = document.getElementById('sliderBottom');
  const topBlock = document.getElementById('top');
  const bottomBlock = document.getElementById('bottom');

  const line = document.getElementById('line');
  const refractedLine = document.getElementById('refractedLine');
  const reflectedLine = document.getElementById('reflectedLine');

  const outputN1 = document.getElementById('outputTop');
  const outputN2 = document.getElementById('outputBottom');
  outputN1.textContent = 'n1: 1.00';
  outputN2.textContent = 'n2: 1.00';

  let angle = 0;

  const container = document.getElementById('container');
  let isMouseDown = false;

  const checkbox = document.getElementById('enablePolarization');
  const lineContainer = document.getElementById('lineContainer');
  const polarLine = document.getElementById('polarLine');
  const checkboxContainer = document.getElementById('checkbox-container');
  
  let isMouseDownPolar = false;
  let polar_angle = 0;
  let enable_polar = false;

  checkbox.addEventListener('change', function() {
    if (this.checked) {
      lineContainer.style.transitionDelay = '0.3s';
      checkboxContainer.style.transitionDelay = '0s';
      lineContainer.style.height = '15rem';

      checkboxContainer.style.borderBottomLeftRadius = '0';
      checkboxContainer.style.borderBottomRightRadius = '0';
      enable_polar = true;
      refractAndReflect(angle, sliderTop, sliderBottom, reflectedLine, refractedLine, outputN1, outputN2, enable_polar, polar_angle);
    } else {
      lineContainer.style.transitionDelay = '0s';
      checkboxContainer.style.transitionDelay = '0.3s';
      lineContainer.style.height = '0';

      checkboxContainer.style.borderBottomLeftRadius = '2rem';
      checkboxContainer.style.borderBottomRightRadius = '2rem';
      enable_polar = false;
      refractAndReflect(angle, sliderTop, sliderBottom, reflectedLine, refractedLine, outputN1, outputN2, enable_polar, polar_angle);
    }
  });

  lineContainer.addEventListener('mousedown', function(event) {
    isMouseDownPolar = true;
    polar_angle = calculateAngle(event, lineContainer);
    rotateLine(polar_angle, polarLine);
    refractAndReflect(angle, sliderTop, sliderBottom, reflectedLine, refractedLine, outputN1, outputN2, enable_polar, polar_angle);
  });

  lineContainer.addEventListener('mousemove', function(event) {
    if (isMouseDownPolar) {
      polar_angle = calculateAngle(event, lineContainer);
      rotateLine(polar_angle, polarLine);
      refractAndReflect(angle, sliderTop, sliderBottom, reflectedLine, refractedLine, outputN1, outputN2, enable_polar, polar_angle);
    }
  });

  lineContainer.addEventListener('mouseup', function() {
    isMouseDownPolar = false;
  });

  container.addEventListener('mousedown', function(event) {
    isMouseDown = true;
    angle = calculateAngle(event, container);
    rotateLine(angle, line);
    refractAndReflect(angle, sliderTop, sliderBottom, reflectedLine, refractedLine, outputN1, outputN2, enable_polar, polar_angle);
  });

  container.addEventListener('mousemove', function(event) {
    if (isMouseDown) {
      angle = calculateAngle(event, container);
      rotateLine(angle, line);
      refractAndReflect(angle, sliderTop, sliderBottom, reflectedLine, refractedLine, outputN1, outputN2, enable_polar, polar_angle);
    }
  });

  container.addEventListener('mouseup', function() {
    isMouseDown = false;
  });

  sliderTop.addEventListener('input', function() {
    updateOpacity(topBlock, sliderTop);
    refractAndReflect(angle, sliderTop, sliderBottom, reflectedLine, refractedLine, outputN1, outputN2, enable_polar, polar_angle);
  });

  sliderBottom.addEventListener('input', function() {
      updateOpacity(bottomBlock, sliderBottom);
      refractAndReflect(angle, sliderTop, sliderBottom, reflectedLine, refractedLine, outputN1, outputN2, enable_polar, polar_angle);
  });
});





