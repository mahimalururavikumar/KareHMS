import jwt from 'jsonwebtoken';

const generateToken = (user) => {

    const secretKey = process.env.JWT_KEY;
    if (!secretKey) {
        console.log('JWT Secret Key is not defined')
        throw new Error('JWT Secret Key is not defined. Set the JWT_KEY environment variable.');
    }

    return jwt.sign(
        { email: user.email, id: user._id },
        secretKey,
        { expiresIn: '1h' }
    );
}

export default generateToken;