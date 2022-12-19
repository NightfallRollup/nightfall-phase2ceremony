// import Accordion from '@mui/material/Accordion';
// import AccordionSummary from '@mui/material/AccordionSummary';
// import AccordionDetails from '@mui/material/AccordionDetails';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
