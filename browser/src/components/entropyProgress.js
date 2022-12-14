import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import { ENTROPY_ARRAY_MAX_SIZE } from '../constants';

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  marginBottom: '2%',
}));

export default function EntropyProgress({ entropy, entropyArr, isMobile, entropyOverride }) {
  if (!entropy && !isMobile && !entropyOverride) {
    return (
      <>
        <p>Collecting Entropy...</p>
        <StyledLinearProgress
          color="secondary"
          variant="determinate"
          value={(entropyArr.length * 100) / ENTROPY_ARRAY_MAX_SIZE}
        />
      </>
    );
  }
}
