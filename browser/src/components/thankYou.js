import Typography from '@mui/material/Typography';

export default function ThankYou({ circuits, circuitsSubmitted, verifications }) {
  if (circuits.every((circuit, i) => circuit === circuitsSubmitted[i])) {
    return (
      <>
        <Typography paragraph align="center" variant="h5" marginTop={'4%'}>
          Thank you for your contribution!
        </Typography>
      </>
    );
  }
}
