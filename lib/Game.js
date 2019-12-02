
const Matter = window.Matter;

class Game {

    constructor ( canvas ) {
        this.canvas = canvas;

        this.isRunning = false;

        this.joints = {

        };
    }

    addBox () {
        const newBox = Matter.Bodies.rectangle(300, 100, 80, 80);
        Matter.Composite.add(this.engine.world, [ newBox ]);
    }

    addBall () {
        const ball = Matter.Bodies.circle(300, 100, 40);
        Matter.Composite.add(this.engine.world, [ ball ]);
    }

    getAngle ( leftPoint, rightPoint ) {

        let angle = Math.atan2(
            Math.abs( rightPoint.y - leftPoint.y ) / 2,
            Math.abs( rightPoint.x - leftPoint.x ) / 2
        );

        if ( leftPoint.y > rightPoint.y ) {
            angle *= -1;
        }

        return angle;
    }

    getDistance ( leftPoint, rightPoint ) {
        const xd = leftPoint.x - rightPoint.x;
        const yd = leftPoint.y - rightPoint.y;

        return Math.sqrt( xd * xd + yd * yd );
    }

    run () {

        const Engine = Matter.Engine,
            Render = Matter.Render,
            World = Matter.World,
            Bodies = Matter.Bodies;

        // create an engine
        this.engine = Engine.create();

        // create a renderer
        this.render = Render.create({
            canvas: this.canvas,
            engine: this.engine,
            options: {
                background: 'transparent',
                wireframeBackground: 'transparent',
                width: 600,
                height: 500,
                wireframes: false
            }
        });

        // create two boxes and a ground
        const boxA = Bodies.rectangle(280, 200, 80, 80);
        const boxB = Bodies.rectangle(310, 50, 80, 80);

        boxA.restitution = 0.5;
        boxB.restitution = 0.5;

        //Matter.Body.setMass( boxA, 2);
        //Matter.Body.setMass( boxB, 2);

        //var ground = Bodies.rectangle(400, 410, 810, 60, { isStatic: true });

        // add all of the bodies to the world
        World.add(this.engine.world, [boxA, boxB]);

        // run the engine
        Engine.run(this.engine);

        // run the renderer
        Render.run(this.render);

        this.isRunning = true;
    }

    updateJoint ( name, startPart, endPart ) {

        if ( ! this.joints[ name ] ) {

            this.joints[ name ] = {
                currentLength: endPart.position.x - startPart.position.x,
                body: Matter.Bodies.rectangle(
                    ( startPart.position.x + endPart.position.x ) / 2,
                    ( startPart.position.y + endPart.position.y ) / 2,

                    this.getDistance( startPart.position, endPart.position ),
                    20,
                    { isStatic: true }
                )
            };

            this.joints[ name ].body.render.fillStyle = '#ffcc00';

            Matter.Body.setAngle( this.joints[ name ].body,
                this.getAngle( startPart.position, endPart.position ) );

            //Matter.Body.setMass( this.upper, 3);

            Matter.Composite.add(this.engine.world, [ this.joints[ name ].body ]);

        } else {

            Matter.Body.setPosition(
                this.joints[ name ].body,
                Matter.Vector.create(
                    ( startPart.position.x + endPart.position.x ) / 2,
                    ( startPart.position.y + endPart.position.y ) / 2
                )
            );

            Matter.Body.setAngle( this.joints[ name ].body,
                this.getAngle( startPart.position, endPart.position ) );

            // TODO Scale should of course work on the correct length
            // Matter.Body.scale(
            //     this.joints[ name ].body,
            //     Math.abs( endPart.position.x - startPart.position.x ) /
            //     Math.abs( this.joints[ name ].currentLength ),
            //     1
            // );
            this.joints[ name ].currentLength = endPart.position.x - startPart.position.x;
        }        
    }

    updatePeddles ( joints ) {

        if ( this.isRunning ) {

            for ( let name in this.joints ) {
                Matter.Composite.remove( this.engine.world, this.joints[ name ].body );
            }
            this.joints = {};

            if ( joints.leftShoulder && joints.rightShoulder ) {

                this.updateJoint( 'upper', joints.leftShoulder, joints.rightShoulder );
            }

            if ( joints.leftShoulder && joints.leftElbow ) {
                this.updateJoint( 'leftUpper', joints.leftElbow, joints.leftShoulder );
            }

            if ( joints.leftWrist && joints.leftElbow ) {
                this.updateJoint( 'leftLower', joints.leftElbow, joints.leftWrist );
            }

            if ( joints.rightShoulder && joints.rightElbow ) {
                this.updateJoint( 'rightUpper', joints.rightShoulder, joints.rightElbow );
            }

            if ( joints.rightWrist && joints.rightElbow ) {
                this.updateJoint( 'rightLower', joints.rightWrist, joints.rightElbow );
            }

        }
    }
}


export default Game;