const canvas = document.getElementById("myCanvas")
canvas.width = 200;

const netCanvas = document.getElementById("networkCanvas")
netCanvas.width = 300;

const ctx = canvas.getContext("2d");
const netCtx = netCanvas.getContext("2d");

const road = new Road(canvas.width/2,canvas.width*0.92);

const N = 100;
let cars;
let bestcar;
let traffic = [];
let gen = 0;

function load(){
    cars = generateCars(N);
    if(localStorage.getItem("bestBrain")){
        for (let i = 0; i < cars.length; i++) {
            cars[i].brain=JSON.parse(localStorage.getItem("bestBrain"));   
            if(i!=0){
                NeuralNetwork.mutate(cars[i].brain,0.2);
            }
        }
    }
    if(localStorage.getItem("gen")){
        gen = parseInt(localStorage.getItem("gen")) + 1;
        document.getElementById("gen").textContent = gen;
    }

    traffic = [
        new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2),
        new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2),
        new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2),
    
    ];
    for (let i = 0; i < 100; i++) {
        traffic.push(new Car(road.getLaneCenter(Math.round(Math.random()*2)),Math.random()*-25000-500,30,50,"DUMMY",Math.random()*5))
    }
}
load();
animate();

function save(){
    localStorage.setItem("bestBrain", JSON.stringify(bestcar.brain))
    localStorage.setItem("gen", JSON.stringify(gen))

}

function discard(){
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("gen");
    location.reload()
}

function generateCars(N){
    const cars=[];
    for (let i = 0; i < N; i++) {
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"))
    }
    return cars
}

function nextGen(){
    save();
    load();
}
setInterval(()=>{
    if(cars.every(car=> car.damaged==true)){
        console.log("todos muertos");
        nextGen();
    }
},2000)

function animate(time){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders, [])
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic)
    }

    canvas.height = window.innerHeight;
    netCanvas.height = window.innerHeight;


    //camara follows car
    ctx.save();

    cars.sort((carA, carB)=>carA.y - carB.y);
    bestcar = firstAlive(cars);
    ctx.translate(0, -bestcar.y+canvas.height*0.7);


    road.draw(ctx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(ctx, "red");
    }
    ctx.globalAlpha=0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(ctx, "blue");
    }
    ctx.globalAlpha=1;
    bestcar.draw(ctx, "blue",true);

    

    ctx.restore();

    netCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(netCtx, bestcar.brain)
    requestAnimationFrame(animate);
}

function firstAlive(cars){
    cars.forEach(car => {
        if(!car.damaged){
            return car
        }
    });
    return cars[0];
}