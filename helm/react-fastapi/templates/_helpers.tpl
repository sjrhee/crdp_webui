{{- define "react-fastapi.name" -}}
{{- .Chart.Name -}}
{{- end -}}

{{- define "react-fastapi.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
