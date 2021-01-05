var c_size, n = 5, color = "#039BE5",
    c = document.getElementById('c'),
    ctx = c.getContext('2d');

c.width = 45;
c.height = 45;
sierpinski(0, c.height, c.width/2, 0, c.width, c.height, n)

function drawTriangle(x1, y1, x2, y2, x3, y3) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.fillStyle = color;
    ctx.fill();
}

function sierpinski(x1, y1, x2, y2, x3, y3, n) {
    if(n > 0) {     
        var x12 = (x1 + x2)/2;
        var y12 = (y1 + y2)/2;
        var x23 = (x2 + x3)/2;
        var y23 = (y2 + y3)/2;
        var x31 = (x3 + x1)/2;
        var y31 = (y3 + y1)/2;
        
        drawTriangle(x31, y31, x12, y12, x23, y23);
        sierpinski(x1, y1, x12, y12, x31, y31, n-1);
        sierpinski(x2, y2, x12, y12, x23, y23, n-1);
        sierpinski(x3, y3, x31, y31, x23, y23, n-1);
    }
}
