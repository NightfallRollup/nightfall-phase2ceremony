import Typography from '@mui/material/Typography';

export default function ThankYou({ circuits, circuitsSubmitted, circuitsFailed }) {
  if (circuits.length === circuitsSubmitted.length + circuitsFailed.length) {
    return (
      <>
        <Typography paragraph align="center" variant="h5" marginTop={'4%'}>
          Thank you for your contribution!
        </Typography>
      </>
    );
  }
}
