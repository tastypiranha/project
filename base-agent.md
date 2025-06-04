# Base Agent Implementation

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, List
import logging
from datetime import datetime

class BaseAgent(ABC):
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.logger = logging.getLogger(self.name)
    
    @abstractmethod
    def process(self, content: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Process the input content and return structured data"""
        pass
    
    def log_action(self, action: str, details: Dict[str, Any]):
        """Log agent actions for audit trail"""
        log_entry = {
            "agent": self.name,
            "action": action,
            "timestamp": datetime.now().isoformat(),
            "details": details
        }
        self.logger.info(json.dumps(log_entry))
        return log_entry
```