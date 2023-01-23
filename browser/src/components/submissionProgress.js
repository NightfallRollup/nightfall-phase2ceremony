import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';

const StyledList = styled(List)(({ theme }) => ({
  flex: '1 0 100%',
  margin: '2% auto',
}));

export default function SubmissionProgress({ circuits, circuitsSubmitted, circuitsFailed }) {
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
            <ListItemText primary={circuit} />
          </ListItem>
        );
      })}
    </StyledList>
  );
}
