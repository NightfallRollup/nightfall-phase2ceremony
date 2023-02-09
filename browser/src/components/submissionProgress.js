import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import { buf2hex } from '../utils';

const StyledList = styled(List)(({ theme }) => ({
  flex: '1 0 100%',
  margin: '2% auto',
}));

function getCircuitDescription(circuit, circuitContributionHash) {
  let contributionHash = null;

  circuitContributionHash.forEach(e => e.circuit === circuit ? contributionHash = e.contributionHash : null);

  if(! contributionHash) return circuit;

  return `${circuit} (Contribution hash: ${buf2hex(contributionHash)})`;
}

export default function SubmissionProgress({ circuits, circuitsSubmitted, circuitsFailed, circuitContributionHash }) {
  return (
    <StyledList>
      {circuits.map(circuit => {
        return (
          <ListItem disablePadding key={circuit}>
            <ListItemIcon>
              { ! circuitsFailed.includes(circuit) ?
                    circuitsSubmitted.includes(circuit) ? (
                        <CheckIcon />
                      ) : (
                        <CircularProgress color="secondary" size={24} />
                      )
                    : (<BlockIcon />)
              }
            </ListItemIcon>
            <ListItemText primary={getCircuitDescription(circuit, circuitContributionHash)} />
          </ListItem>
        );
      })}
    </StyledList>
  );
}
